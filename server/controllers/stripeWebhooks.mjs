import stripe from 'stripe';// Assicurati che il percorso sia corretto
import { inngest } from '../inngest/index.mjs';

import Booking from '../models/Booking.mjs';  // Assicurati di importare inngest se lo stai usando

export const stripeWebhooks = async (request, response) => {
    // Inizializza l'istanza di Stripe. È buona pratica farlo fuori dalla funzione
    // se il tuo ambiente lo permette per evitare di ricrearla ad ogni richiesta,
    // ma per chiarezza, va bene anche qui se stripe è gestito come modulo unico.
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];

    let event;
    try {
        // Costruisce l'evento Stripe verificando la firma
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch(error) {
        // Logga l'errore per il debug e restituisce uno stato 400
        console.error(`❌ Webhook signature verification failed: ${error.message}`);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Gestisce i diversi tipi di eventi Stripe
    try {
        switch(event.type) {
            // L'evento raccomandato per l'adempimento dell'ordine è 'checkout.session.completed'
            case 'checkout.session.completed': {
                // L'oggetto sessione è direttamente disponibile in event.data.object
                const session = event.data.object;

                // Controlla se la sessione o i suoi metadata sono presenti
                if (!session || !session.metadata) {
                    console.error('Stripe webhook: Session or metadata not found in checkout.session.completed event.', session);
                    return response.status(400).send('Session or metadata not found');
                }

                const { bookingId } = session.metadata;

                // Aggiorna il booking nello your database
                // Assicurati che bookingId sia un ID valido per il tuo modello Booking
                const updatedBooking = await Booking.findByIdAndUpdate(
                    bookingId,
                    {
                        isPaid: true,
                        paymentLink: '' // Potresti voler lasciare paymentLink se vuoi che rimanga visibile
                    },
                    { new: true } // Restituisce il documento aggiornato
                );

                if (!updatedBooking) {
                    console.warn(`Booking with ID ${bookingId} not found for update.`);
                    return response.status(404).send(`Booking with ID ${bookingId} not found.`);
                }

                // Invia l'evento Inngest
                await inngest.send({
                    name: 'app/show.booked',
                    data: { bookingId }
                });

                console.log('✅ Checkout session completed and booking updated successfully!');
                console.log('Session ID:', session.id);
                console.log('Booking ID:', bookingId);
                console.log('Updated Booking:', updatedBooking);

                break;
            }
            // Aggiungi altri case per gestire altri eventi se necessario
            // ad esempio, 'payment_intent.failed' per gestire pagamenti falliti
            // case 'payment_intent.failed': {
            //     const paymentIntent = event.data.object;
            //     console.warn('Payment Intent failed:', paymentIntent.id);
            //     // Implementa la logica per gestire i pagamenti falliti (es. notifica utente, revert booking)
            //     break;
            // }
            default:
                // Logga gli eventi non gestiti
                console.log('Unhandled event type: ' + event.type);
        }

        // Invia una risposta JSON di successo
        response.json({ received: true });
    } catch(error) {
        // Logga errori interni e restituisce uno stato 500
        console.error(`🚨 Internal Webhook Error: ${error.message}`, error);
        response.status(500).send(`Internal server error: ${error.message}`);
    }
}

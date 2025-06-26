import stripe from 'stripe';

import Booking from '../models/Booking.mjs';

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];

    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch(error) {
        return response.status(400).send(`Webhook error: ${error.message}`);
    }

    try {
        switch(event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                });

                const session = sessionList[0];
                if (!session || !session.metadata) {
                    console.log('Stripe webhook: session or metadata not found', sessionList);
                    return response.status(400).send('Session or metadata not found');
                }
                const { bookingId } = session.metadata;

                await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: ''
                });

                await inngest.send({
                    name: 'app/show.booked',
                    data: { bookingId }
                });

                console.log('paymentIntent:', paymentIntent);
                console.log('sessionList:', sessionList);
                console.log('session:', session);
                console.log('bookingId:', bookingId);

                break;
            }
            default: 
                console.log('Unhandled event type: ' + event.type);
        }

        response.json({ received: true });
    } catch(error) {
        console.log(`Webhook error: ${error.message}`);
        response.status(500).send(`Internal server error: ${error.message}`);
    }
}
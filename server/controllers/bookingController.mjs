import stripe from 'stripe';

import Show from "../models/Show.mjs";
import Booking from "../models/Booking.mjs";

import { inngest } from '../inngest/index.mjs';

const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch(error) {
        console.log(error);
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
        if(!isAvailable) res.json({ success: false, message: 'Selected seats are not avaiable' });

        const showData = await Show.findById(showId).populate('movie');
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats,

        });

        selectedSeats.map(seat => {
            showData.occupiedSeats[seat] = userId;
        });
        showData.markModified('occupiedSeats');
        await showData.save();

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: showData.movie.title,
                },
                unit_amount: Math.floor(booking.amount) * 100,
            },
            quantity: 1,
        }];

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString(),
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        });

        booking.paymentLink = session.url;
        console.log('Stripe session: ' + session);
        await booking.save();

        await inngest.send({
            name: 'app/checkpayment',
            data: {
                bookingId: booking._id.toString(),
            }
        });

        res.json({ success: true, url: session.url });
    } catch(error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);

        const occupiedSeats = Object.keys(showData.occupiedSeats);

        res.json({ success: true, occupiedSeats });
    } catch(error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
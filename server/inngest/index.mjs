import { Inngest } from "inngest";

import User from '../models/User.mjs';
import Booking from '../models/Booking.mjs';
import Show from '../models/Show.mjs';
import sendEmail from "../configs/nodeMailer.mjs";

export const inngest = new Inngest({ id: 'movie-ticket-booking' });

const syncUserCreation = inngest.createFunction(
    { id: 'create-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url,
        };

        await User.create(userData);
    }
);

const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id } = event.data;
        await User.findByIdAndDelete(id);
    }
);

const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url,
        };

        await User.findByIdAndUpdate(id, userData);
    }
);

const releaseSeatsAndDeleteBookings = inngest.createFunction(
    { id: 'release-seat-delete-bookings' },
    { event: 'app/checkpayment' },
    async ({ event, step }) => {
        const tenMinLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes', tenMinLater);

        await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId);

            if(!booking.isPaid) {
                const show = await Show.findById(booking.show);
                booking.bookedSeats.forEach(seat => {
                    delete show.occupiedSeats[seat];
                });

                show.markModified('occupiedSeats');
                await show.save();
                await Booking.findByIdAndDelete(booking._id);
            }
        });
    }
);

const sendBookingConfirmationEmail = inngest.createFunction(
    { id: 'send-booking-confirmation-email' },
    { event: 'app/show.booked' },
    async ({ event, step }) => {
        const { bookingId } = event.data;
        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: {
                path: 'movie',
                model: 'Movie'
            }
        }).populate('user');

        await sendEmail({
            to: booking.user.email,
            subject: `Payment confirmation: "${booking.show.movie.title}" booked!`,
            body: `<div style = "font-family: Arial, sans-serif; line-height: 1.5;">
                        <h2>Hi ${booking.user.name},</h2>
                        <p>Your booking for <strong style = "color: #f84565">"${booking.show.movie.title}"</strong> is confirmed.</p>
                        <p>
                            <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocalDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br/>
                            <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocalTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
                        </p>
                        <p>Enjoy the show!</p>
                        <p>Thanks for booking with us!<br/>- QuickShow Team</p>
                    </div>`
        });
    }
);

export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBookings,
    sendBookingConfirmationEmail,
];
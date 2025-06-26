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
                            <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br/>
                            <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
                        </p>
                        <p>Enjoy the show!</p>
                        <p>Thanks for booking with us!<br/>- QuickShow Team</p>
                    </div>`
        });
    }
);

const sendShowReminder = inngest.createFunction(
    { id: 'send-show-reminder' },
    { cron: '0 */8 * * *' },
    async ({ step }) => {
        const now = new Date();
        const in8h = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const windowStart = new Date(in8h.getTime() - 10 * 60 * 1000);

        const reminderTasks = await step.run('prepare-reminder-tasks', async () => {
            const shows = await Show.find({
                showTime: {  $gte: windowStart, $lte: in8h}
            }).populate('movie');

            const tasks = [];
            for(const show of shows) {
                if(!show.movie || !show.occupiedSeats) continue;

                const userIds = [...new set(Object.values(show.occupiedSeats))];
                if(userIds.length === 0) continue;

                const users = await User.find({ _id: { $in: userIds } }.select('name email'));

                for(const user of users) {
                    tasks.push({
                        userEmail: user.email,
                        userName: user.name,
                        movieTitle: show.movie.title,
                        showTime: show.showTime,
                    });
                }
            }

            return tasks; 
        });

        if(reminderTasks.length === 0) return { sent: 0, message: 'No reminders sent.' }

        const results = await step.run('send-all-reminders', async () => {
            return await Promise.allSettled(
                reminderTasks.map(task => sendEmail({
                    to: task.userEmail,
                    subject: `Reminder: your movie "${task.movieTitle}" starts soon!`,
                    body: `<h2>Reminder</h2>`
                }))
            )
        });

        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - sent;

        return { sent, failed, message: `Sent ${sent} reminders, ${failed} failed.` };
    }
);

export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBookings,
    sendBookingConfirmationEmail,
    sendShowReminder,
];
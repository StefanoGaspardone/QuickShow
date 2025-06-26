import express from 'express';
import { createBooking, getOccupiedSeats } from '../controllers/bookingController.mjs';

const router = express.Router();

router.post('/', createBooking);
router.get('/seats/:showId', getOccupiedSeats);

export default router;
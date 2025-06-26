import express from 'express';

import { getAllBookings, getAllShows, getDashboardData, isAdmin } from '../controllers/adminController.mjs';
import { protectAdmin } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/is-admin', protectAdmin, isAdmin);
router.get('/dashboard', protectAdmin, getDashboardData);
router.get('/shows', protectAdmin, getAllShows);
router.get('/bookings', protectAdmin, getAllBookings);

export default router;
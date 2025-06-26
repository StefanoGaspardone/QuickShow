import express from 'express';

import { getBookings, getFavorites, updateFavorite } from '../controllers/userController.mjs';

const router = express.Router();

router.get('/bookings', getBookings);
router.get('/favorites', getFavorites);
router.put('/favorites', updateFavorite);

export default router;
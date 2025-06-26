import express from 'express';

import { addShow, getNowPlayingMovies, getShow, getShows } from '../controllers/showController.mjs';
import { protectAdmin } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/now-playing', protectAdmin, getNowPlayingMovies);
router.post('/', protectAdmin, addShow);
router.get('/', getShows);
router.get('/:movieId', getShow);

export default router;
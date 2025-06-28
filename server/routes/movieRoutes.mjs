import express from 'express';

import { addMovie, deleteMovie, getMovie, getMovies, getProgress, getShows, updateProgress } from '../controllers/movieController.mjs';

import { protectAdmin, requireAuth } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/', getMovies);
router.post('/', requireAuth, protectAdmin, addMovie);
router.get('/:movieId', getMovie);
router.get('/:movieId/shows', getShows);
router.get('/:movieId/progress', requireAuth, getProgress);
router.post('/:movieId/progress', requireAuth, updateProgress);
// router.put('/:movieId', ...);
router.delete('/:movieId', requireAuth, protectAdmin, deleteMovie);

export default router;
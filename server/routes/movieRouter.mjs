import express from 'express';

import { addMovie, getMovie, getMovies } from '../controllers/movieController.mjs';

import { protectAdmin } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/', getMovies);
router.post('/', protectAdmin, addMovie);
router.get('/:movieId', getMovie);

export default router;
import express from 'express';

import { addSeries, deleteSerie, getSerie, getSeries } from '../controllers/seriesController.mjs';

import { protectAdmin, requireAuth } from '../middleware/auth.mjs';

const router = express.Router();

router.get('/', getSeries);
router.post('/', requireAuth, protectAdmin, addSeries);
router.get('/:seriesId', getSerie);
router.delete('/:seriesId', requireAuth, protectAdmin, deleteSerie);

export default router;
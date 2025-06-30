import express from 'express';
import multer from 'multer';

import { uploadVideo } from '../controllers/uploadController.mjs';

import { protectAdmin, requireAuth } from '../middleware/auth.mjs';


const router = express.Router();
const upload = multer({ dest: 'tmp/', limits: { fileSize: 5 * 1024 * 1024 * 1024 } });

router.post('/', requireAuth, protectAdmin, upload.single('video'), uploadVideo);

export default router;
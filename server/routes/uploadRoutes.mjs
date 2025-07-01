import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

import { protectAdmin, requireAuth } from '../middleware/auth.mjs';
import upload from '../configs/multer.mjs';

const router = express.Router();

router.post('/', requireAuth, protectAdmin, upload.single('video'), async (req, res) => {
    try {
        if(!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const inputPath = path.join('public/videos', req.file.filename);
        const outputPath = path.join('public/videos', 'optimized_' + req.file.filename);

        exec(`ffmpeg -i "${inputPath}" -movflags +faststart -c copy "${outputPath}"`, (error, stdin, stderr) => {
            if(!error) {
                fs.renameSync(outputPath, inputPath);
                const url = `/videos/${req.file.filename}`;
                res.status(201).json({ success: true, url });
                console.log('not error');
            } else {
                console.error('ffmpeg error:', error);
                console.error('stderr:', stderr);
                const url = `/videos/${req.file.filename}`;
                res.status(201).json({ success: true, url });
            }
        });
    } catch(error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
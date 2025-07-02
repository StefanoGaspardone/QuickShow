import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import crypto from 'crypto';

import { protectAdmin, requireAuth } from '../middleware/auth.mjs';
import upload from '../configs/multer.mjs';

const router = express.Router();

const getFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', data => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

router.post('/', requireAuth, protectAdmin, upload.single('video'), async (req, res) => {
    try {
        if(!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const inputPath = path.join('public/videos', req.file.filename);
        
        const uploadedHash = await getFileHash(inputPath);
        const files = fs.readdirSync('public/videos');
        for(const file of files) {
            const filePath = path.join('public/videos', file);

            if (fs.statSync(filePath).isFile()) {
                const hash = await getFileHash(filePath);
                if(hash === uploadedHash) {
                    fs.unlinkSync(inputPath);

                    const url = `/videos/${file}`;
                    return res.status(200).json({ success: true, url, alreadyExists: true });
                }
            }
        }

        const outputPath = path.join('public/videos', 'optimized_' + req.file.filename);
        exec(`ffmpeg -i "${inputPath}" -movflags +faststart -c copy "${outputPath}"`, (error, stdin, stderr) => {
            if(!error) {
                fs.renameSync(outputPath, inputPath);
                const url = `/videos/${req.file.filename}`;

                res.status(201).json({ success: true, url });
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
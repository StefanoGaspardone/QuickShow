import multer from 'multer';
import path from 'path';
import fs from 'fs';

const videoDir = path.resolve('public/videos');
if(!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, videoDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 4 * 1024 * 1024 * 1024 // 4GB
    },
    fileFilter: (req, file, cb) => {
        if(!file.mimetype.startsWith('video/')) return cb(new Error('Only video files are allowed'));
        cb(null, true);
    }
});

export default upload;
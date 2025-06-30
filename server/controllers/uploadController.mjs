import fs from 'fs';

import cloudinary from '../configs/cloudinary.mjs';

export const uploadVideo  = async (req, res) => {
    try {
        if(!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: 'quickshow/videos'
        });

        fs.unlinkSync(req.file.path);
        res.status(201).json({ success: true, url: result.secure_url, public_id: result.public_id });
    } catch(error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}
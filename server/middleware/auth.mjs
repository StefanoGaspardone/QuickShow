import { clerkClient } from '@clerk/express';

export const protectAdmin = async (req, res, next) => {
    try {
        const { userId } = req.auth();

        const user = await clerkClient.users.getUser(userId);

        if(user.privateMetadata.role !== 'admin') {
            return res.json({ success: false, message: 'Not Authorized' });
        }

        next();
    } catch(error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}

export const requireAuth = async (req, res, next) => {
    const { userId } = req.auth();

    if(!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    next();
};
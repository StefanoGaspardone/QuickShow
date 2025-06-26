import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';

import showRouter from './routes/showRoutes.mjs';
import bookingRouter from './routes/bookingRoutes.mjs';
import adminRouter from './routes/adminRoutes.mjs';
import userRouter from './routes/userRoutes.mjs';

import connectDB from './configs/db.mjs';
import { inngest, functions } from './inngest/index.mjs';

const app = express();
const port = 3000;

await connectDB();

/* MIDDLEWARES */ 
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(clerkMiddleware());

/* APIs */
app.get('/', (req, res) => res.send('Server is ready!'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/shows', showRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

/* RUN THE SERVER */
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
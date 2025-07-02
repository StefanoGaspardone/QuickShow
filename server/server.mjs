import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import timeout from 'connect-timeout';

import showRouter from './routes/showRoutes.mjs';
import bookingRouter from './routes/bookingRoutes.mjs';
import adminRouter from './routes/adminRoutes.mjs';
import userRouter from './routes/userRoutes.mjs';
import movieRouter from './routes/movieRoutes.mjs';
import seriesRouter from './routes/seriesRoutes.mjs';
import uploadRouter from './routes/uploadRoutes.mjs';

import { stripeWebhooks } from './controllers/stripeWebhooks.mjs';

import connectDB from './configs/db.mjs';
import getLocalIP from './configs/ipAddress.mjs';
import { inngest, functions } from './inngest/index.mjs';

const app = express();
const port = 3000;
const host = '0.0.0.0';

await connectDB();

app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.use('/videos', express.static('public/videos'));

/* MIDDLEWARES */ 
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(clerkMiddleware());
app.use(timeout('60m'));

app.use((req, res, next) => {
    if(!req.timedout) next();
});

/* APIs */
app.get('/', (req, res) => res.send('Server is ready!'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/shows', showRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// NEW APIs
app.use('/api/movies', movieRouter);
app.use('/api/series', seriesRouter);
app.use('/api/upload', uploadRouter);

/* RUN THE SERVER */
app.listen(port, host, () => console.log(`Server listening at http://${getLocalIP()}:${port}`));
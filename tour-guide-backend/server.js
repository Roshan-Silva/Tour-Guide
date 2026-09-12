import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import placeRoutes from './routes/placeRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import driverPortalRoutes from './routes/driverPortalRoutes.js';
import BookingLock from './models/BookingLock.js';
import tripPlannerRoutes from './routes/tripPlannerRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import Favorite from './models/Favorite.js';
import Review from './models/Review.js';
import Place from './models/Place.js';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import swaggerUi from 'swagger-ui-express';
import openapi from './docs/openapi.js';
import Payment from './models/Payment.js';
import Payout from './models/Payout.js';
import Refund from './models/Refund.js';
import Commission from './models/Commission.js';
import { autoCompleteEligibleBookings, processOverdueCommissions } from './services/commissionService.js';
import { validateIdentityConfiguration } from './services/driverIdentityService.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: { directives: { scriptSrc: ["'self'", "'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'"] } } }));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((value) => value.trim());
app.use(cors({ origin: (origin, callback) => !origin || allowedOrigins.includes(origin) ? callback(null, true) : callback(Object.assign(new Error('Origin is not allowed by CORS'), { status: 403 })), credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Tour Guide API is working');
});
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ceylon-explorer-api' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Ceylon Explorer API' }));
app.get('/api-docs.json', (_req, res) => res.json(openapi));

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 400, standardHeaders: true, legacyHeaders: false }));
app.use(['/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password'], rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many attempts. Please try again later.', errors: [] } }));

app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverPortalRoutes);
app.use('/api/trip-planner', tripPlannerRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);

app.use('/api', notFound);
app.use(errorHandler);

for (const name of ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET']) if (!process.env[name]) throw new Error(`${name} is not set in the environment variables`);
if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32)) throw new Error('JWT secrets must contain at least 32 characters in production');
validateIdentityConfiguration();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Promise.all([BookingLock.init(), Favorite.init(), Review.init(), Place.init(), Payment.init(), Payout.init(), Refund.init(),Commission.init()]);
    await autoCompleteEligibleBookings();await processOverdueCommissions();
    if(process.env.ENABLE_FINANCIAL_SCHEDULER==='true')setInterval(()=>Promise.all([autoCompleteEligibleBookings(),processOverdueCommissions()]).catch(()=>{}),15*60*1000).unref();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));

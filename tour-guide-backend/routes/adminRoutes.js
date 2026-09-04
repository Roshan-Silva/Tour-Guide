import express from 'express';
import { getAllBookings, getDashboard } from '../controllers/adminController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/bookings', getAllBookings);

export default router;

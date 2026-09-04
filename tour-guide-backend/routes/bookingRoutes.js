import express from 'express';
import { addBooking, cancelBooking, getMyBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to add a new booking
router.post('/add', protect, addBooking);
router.get('/mine', protect, getMyBookings);
router.patch('/:id/cancel', protect, cancelBooking);

export default router;

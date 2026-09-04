import express from 'express';
import { addBooking, cancelBooking, getMyBooking, getMyBookings } from '../controllers/bookingController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to add a new booking
router.post('/add', protect, authorizeRoles('traveler'), addBooking);
router.get('/mine', protect, authorizeRoles('traveler'), getMyBookings);
router.get('/mine/:id', protect, authorizeRoles('traveler'), getMyBooking);
router.patch('/:id/cancel', protect, authorizeRoles('traveler', 'admin'), cancelBooking);

export default router;

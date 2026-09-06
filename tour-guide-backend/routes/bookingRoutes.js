import express from 'express';
import { addBooking, cancelBooking, getMyBooking, getMyBookings } from '../controllers/bookingController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { bookingRules, idParamRules } from '../middleware/validate.js';

const router = express.Router();

// Route to add a new booking
router.post('/add', protect, authorizeRoles('traveler'), bookingRules, addBooking);
router.get('/mine', protect, authorizeRoles('traveler'), getMyBookings);
router.get('/mine/:id', protect, authorizeRoles('traveler'), idParamRules, getMyBooking);
router.patch('/:id/cancel', protect, authorizeRoles('traveler', 'admin'), idParamRules, cancelBooking);

export default router;

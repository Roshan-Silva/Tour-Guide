import express from 'express';
import { acceptBooking, completeBooking, getAssignedBooking, getAssignedBookings, getDriverProfile, rejectBooking, updateDriverProfile } from '../controllers/driverPortalController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();
router.use(protect, authorizeRoles('driver'));
router.get('/profile', getDriverProfile);
router.put('/profile', upload.single('image'), updateDriverProfile);
router.get('/bookings', getAssignedBookings);
router.get('/bookings/:id', getAssignedBooking);
router.patch('/bookings/:id/accept', acceptBooking);
router.patch('/bookings/:id/reject', rejectBooking);
router.patch('/bookings/:id/complete', completeBooking);

export default router;

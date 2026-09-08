import express from 'express';
import { acceptBooking, completeBooking, getAssignedBooking, getAssignedBookings, getDriverProfile, getEarnings, rejectBooking, updateDriverProfile, updateVehicleImage } from '../controllers/driverPortalController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { idParamRules } from '../middleware/validate.js';

const router = express.Router();
router.use(protect, authorizeRoles('driver'));
router.get('/profile', getDriverProfile);
router.put('/profile', upload.single('image'), updateDriverProfile);
router.put('/profile/vehicle-image', upload.single('vehicleImage'), updateVehicleImage);
router.get('/bookings', getAssignedBookings);
router.get('/earnings', getEarnings);
router.get('/bookings/:id', idParamRules, getAssignedBooking);
router.patch('/bookings/:id/accept', idParamRules, acceptBooking);
router.patch('/bookings/:id/reject', idParamRules, rejectBooking);
router.patch('/bookings/:id/complete', idParamRules, completeBooking);

export default router;

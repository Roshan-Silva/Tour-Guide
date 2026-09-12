import express from 'express';
import { acceptBooking, completeBooking, getAssignedBooking, getAssignedBookings, getDriverProfile, rejectBooking, updateDriverProfile, updateVehicleImage } from '../controllers/driverPortalController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { idParamRules } from '../middleware/validate.js';
import { getMyCommission, getMyCommissions, submitCommissionPayment } from '../controllers/commissionController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const commissionPaymentLimit=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false});
router.use(protect, authorizeRoles('driver'));
router.get('/profile', getDriverProfile);
router.put('/profile', upload.single('image'), updateDriverProfile);
router.put('/profile/vehicle-image', upload.single('vehicleImage'), updateVehicleImage);
router.get('/bookings', getAssignedBookings);
router.get('/commissions', getMyCommissions);
router.get('/commissions/:id', idParamRules, getMyCommission);
router.post('/commissions/:id/submit-payment', commissionPaymentLimit, idParamRules, submitCommissionPayment);
router.get('/bookings/:id', idParamRules, getAssignedBooking);
router.patch('/bookings/:id/accept', idParamRules, acceptBooking);
router.patch('/bookings/:id/reject', idParamRules, rejectBooking);
router.patch('/bookings/:id/complete', idParamRules, completeBooking);

export default router;

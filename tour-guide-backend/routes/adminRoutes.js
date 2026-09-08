import express from 'express';
import { getAllBookings, getDashboard, getPayments, getPayouts } from '../controllers/adminController.js';
import { reconcilePayment, requestRefund } from '../controllers/paymentController.js';
import { updatePayout } from '../controllers/payoutController.js';
import { idParamRules } from '../middleware/validate.js';
import rateLimit from 'express-rate-limit';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const financeLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/bookings', getAllBookings);
router.get('/payments', getPayments);
router.post('/payments/:id/reconcile', financeLimit, idParamRules, reconcilePayment);
router.post('/payments/:id/refunds', financeLimit, idParamRules, requestRefund);
router.get('/payouts', getPayouts);
router.patch('/payouts/:id', financeLimit, idParamRules, updatePayout);

export default router;

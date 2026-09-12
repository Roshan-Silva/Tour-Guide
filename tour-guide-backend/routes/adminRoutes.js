import express from 'express';
import { getAllBookings, getDashboard } from '../controllers/adminController.js';
import { idParamRules } from '../middleware/validate.js';
import rateLimit from 'express-rate-limit';
import { approveCommission, disputeCommission, getAdminCommission, getAdminCommissions, rejectCommission, resolveCommission, waiveCommission } from '../controllers/commissionController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const financeLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/bookings', getAllBookings);
router.get('/commissions', getAdminCommissions);
router.get('/commissions/:id',idParamRules,getAdminCommission);
router.patch('/commissions/:id/approve-payment',financeLimit,idParamRules,approveCommission);
router.patch('/commissions/:id/reject-payment',financeLimit,idParamRules,rejectCommission);
router.patch('/commissions/:id/waive',financeLimit,idParamRules,waiveCommission);
router.patch('/commissions/:id/dispute',financeLimit,idParamRules,disputeCommission);
router.patch('/commissions/:id/resolve-dispute',financeLimit,idParamRules,resolveCommission);

export default router;

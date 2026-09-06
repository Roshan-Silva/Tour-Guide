import express from 'express';
import { generatePlan, getMyPlan, getMyPlans, savePlan } from '../controllers/tripPlannerController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { plannerRules } from '../middleware/validate.js';

const router = express.Router();
router.post('/generate', plannerRules, generatePlan);
router.use(protect, authorizeRoles('traveler'));
router.post('/save', plannerRules, savePlan);
router.get('/mine', getMyPlans);
router.get('/mine/:id', getMyPlan);
export default router;

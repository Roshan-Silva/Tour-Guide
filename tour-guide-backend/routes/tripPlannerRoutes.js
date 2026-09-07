import express from 'express';
import { deleteMyPlan, generatePlan, getMyPlan, getMyPlans, renameMyPlan, savePlan } from '../controllers/tripPlannerController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { plannerRules } from '../middleware/validate.js';

const router = express.Router();
router.post('/generate', plannerRules, generatePlan);
router.use(protect, authorizeRoles('traveler'));
router.post('/save', plannerRules, savePlan);
router.get('/mine', getMyPlans);
router.get('/mine/:id', getMyPlan);
router.patch('/mine/:id', renameMyPlan);
router.delete('/mine/:id', deleteMyPlan);
export default router;

import express from 'express';
import { createReview, deleteReview, updateReview } from '../controllers/reviewController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { idParamRules, reviewRules } from '../middleware/validate.js';

const router = express.Router();
router.use(protect, authorizeRoles('traveler'));
router.post('/', reviewRules, createReview);
router.put('/:id', idParamRules, updateReview);
router.delete('/:id', idParamRules, deleteReview);
export default router;

import express from 'express';
import { createReview, deleteReview, updateReview } from '../controllers/reviewController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('traveler'));
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
export default router;

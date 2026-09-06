import express from 'express';
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favoriteController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { favoriteRules } from '../middleware/validate.js';

const router = express.Router();
router.use(protect, authorizeRoles('traveler'));
router.get('/', getFavorites);
router.post('/:destinationId', favoriteRules, addFavorite);
router.delete('/:destinationId', favoriteRules, removeFavorite);
export default router;

import express from 'express';
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favoriteController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('traveler'));
router.get('/', getFavorites);
router.post('/:destinationId', addFavorite);
router.delete('/:destinationId', removeFavorite);
export default router;

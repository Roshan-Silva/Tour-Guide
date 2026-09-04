import express from 'express';
import { addPlace, deletePlace, getPlaces, updatePlace } from '../controllers/placeController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Route to add a new place
router.post('/add', protect, adminOnly, upload.single('image'), addPlace);
router.put('/:id', protect, adminOnly, upload.single('image'), updatePlace);
router.delete('/:id', protect, adminOnly, deletePlace);

// Route to get all places
router.get('/', getPlaces);

export default router;

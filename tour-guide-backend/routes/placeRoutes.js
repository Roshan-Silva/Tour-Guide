import express from 'express';
import { addPlace, deletePlace, getAllPlacesForAdmin, getPlace, getPlaces, updatePlace } from '../controllers/placeController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { destinationRules, idParamRules } from '../middleware/validate.js';

const router = express.Router();

// Route to add a new place
router.post('/add', protect, adminOnly, upload.single('image'), destinationRules, addPlace);
router.put('/:id', protect, adminOnly, idParamRules, upload.single('image'), destinationRules, updatePlace);
router.delete('/:id', protect, adminOnly, idParamRules, deletePlace);
router.get('/admin/all', protect, adminOnly, getAllPlacesForAdmin);

// Route to get all places
router.get('/', getPlaces);
router.get('/:slug', getPlace);

export default router;

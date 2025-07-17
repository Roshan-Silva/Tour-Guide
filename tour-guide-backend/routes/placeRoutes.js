import express from 'express';
import { addPlace, getPlaces } from '../controllers/placeController.js';

const router = express.Router();

// Route to add a new place
router.post('/add', addPlace);

// Route to get all places
router.get('/', getPlaces);

export default router;
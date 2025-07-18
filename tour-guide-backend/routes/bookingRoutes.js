import express from 'express';
import {addBooking} from '../controllers/bookingController.js';

const router = express.Router();

// Route to add a new booking
router.post('/add', addBooking);

export default router;
import express from 'express';

import { addDriver, deleteDriver, getAllDriversForAdmin, getDriver, getDrivers, revealDriverIdentity, updateDriver, verifyDriverIdentity } from '../controllers/driverController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { driverProfileRules, driverQueryRules, idParamRules } from '../middleware/validate.js';

const router = express.Router();

// Route to add a new driver and get all drivers
router.post('/add', protect, adminOnly, upload.single('image'), driverProfileRules, addDriver);
router.get('/', driverQueryRules, getDrivers);
router.get('/admin/all', protect, adminOnly, getAllDriversForAdmin);
router.get('/admin/:id/identity',protect,adminOnly,idParamRules,revealDriverIdentity);
router.put('/admin/:id/identity',protect,adminOnly,idParamRules,verifyDriverIdentity);
router.get('/:id', idParamRules, getDriver);
router.put('/:id', protect, adminOnly, idParamRules, upload.single('image'), driverProfileRules, updateDriver);
router.delete('/:id', protect, adminOnly, idParamRules, deleteDriver);

export default router;

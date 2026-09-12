import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import { BLOCKING_STATUSES } from '../services/bookingRules.js';
import { validateDateRange } from '../utils/dateRange.js';
import Review from '../models/Review.js';
import { deleteCloudAsset } from '../services/cloudinaryService.js';
import { processOverdueCommissions } from '../services/commissionService.js';
import { decryptIdentity, protectDriverIdentity } from '../services/driverIdentityService.js';
import FinancialEvent from '../models/FinancialEvent.js';

const list = (value) => typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value || [];
const bool = (value, fallback = true) => value === undefined ? fallback : value === true || value === 'true';

const driverPayload = (body, image, defaults = {}) => ({
  fullName: body.fullName?.trim() || body.name?.trim(),
  name: body.fullName?.trim() || body.name?.trim(),
  phoneNumber: body.phoneNumber?.trim(),
  profileImage: image,
  profileImagePublicId: defaults.profileImagePublicId || '',
  image,
  bio: body.bio?.trim() || '',
  languages: list(body.languages),
  yearsOfExperience: Number(body.yearsOfExperience || 0),
  serviceAreas: list(body.serviceAreas),
  dailyRate: Number(body.dailyRate || 0),
  vehicleType: body.vehicleType?.trim(),
  vehicleModel: body.vehicleModel?.trim() || '',
  vehicleCapacity: Number(body.vehicleCapacity || 4),
  vehicleImage: body.vehicleImage?.trim() || '',
  availability: bool(body.availability, defaults.availability),
  verificationStatus: body.verificationStatus || defaults.verificationStatus,
});

export const addDriver = async (req, res) => {
  try {
    const suppliedIdentity=req.body.nic&&req.body.drivingLicence?protectDriverIdentity(req.body):{};
    const payload = {...driverPayload(req.body, req.file?.path || req.file?.filename, { availability: false, verificationStatus: 'pending', profileImagePublicId: req.file?.public_id }),...suppliedIdentity,identityVerificationRequired:!suppliedIdentity.nicFingerprint,availability:false,verificationStatus:'pending'};
    if (!payload.fullName || !payload.phoneNumber || !payload.vehicleType || !payload.profileImage) return res.status(400).json({ message: 'Name, phone number, vehicle type and image are required' });
    const driver = await Driver.create(payload);
    const safe={...driver.toObject()};for(const key of ['nicFingerprint','nicEncrypted','nicLast4','drivingLicenceFingerprint','drivingLicenceEncrypted','drivingLicenceLast4'])delete safe[key];res.status(201).json(safe);
  } catch (error) {
    res.status(error.code===11000?409:400).json({ message: error.code===11000?'This identity is already associated with a driver account.':error.message || 'Error adding driver' });
  }
};

export const getDrivers = async (req, res) => {
  const { q, vehicleType, language, serviceArea, minCapacity, minPrice, maxPrice, minRating, startDate: startValue, endDate: endValue } = req.query;
  await processOverdueCommissions();
  const filter = { availability: true, verificationStatus: 'verified',commissionStanding:{$ne:'restricted'},identityVerificationRequired:false,accountStatus:'active' };
  if (q) filter.$or = [{ fullName: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }];
  if (vehicleType) filter.vehicleType = { $regex: vehicleType, $options: 'i' };
  if (language) filter.languages = { $regex: language, $options: 'i' };
  if (serviceArea) filter.serviceAreas = { $regex: serviceArea, $options: 'i' };
  if (minCapacity) filter.vehicleCapacity = { $gte: Number(minCapacity) };
  if (minRating) filter.averageRating = { $gte: Number(minRating) };
  if (minPrice || maxPrice) filter.dailyRate = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
  try {
    if (startValue || endValue) {
      if (!startValue || !endValue) return res.status(400).json({ message: 'Both startDate and endDate are required' });
      let range;
      try { range = validateDateRange(startValue, endValue); }
      catch (error) { return res.status(400).json({ message: error.message }); }
      const bookedIds = await Booking.distinct('driver', {
        status: { $in: BLOCKING_STATUSES }, startDate: { $lte: range.endDate }, endDate: { $gte: range.startDate },
      });
      filter._id = { $nin: bookedIds };
    }
    const drivers = await Driver.find(filter).select('-phoneNumber').sort({ averageRating: -1, fullName: 1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drivers' });
  }
};

export const getDriver = async (req, res) => {
  try {
    await processOverdueCommissions(req.params.id);
    const driver = await Driver.findOne({ _id: req.params.id, availability: true, verificationStatus: 'verified',commissionStanding:{$ne:'restricted'},identityVerificationRequired:false,accountStatus:'active' }).select('-user -phoneNumber');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    const reviews = await Review.find({ driver: driver._id }).populate('traveler', 'name').sort({ createdAt: -1 });
    res.json({ driver, reviews });
  } catch (error) { res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid driver ID' : 'Error fetching driver' }); }
};

export const getAllDriversForAdmin = async (req, res) => {
  try { await processOverdueCommissions();const rows=await Driver.find().select('+nicLast4 +drivingLicenceLast4').populate('user', 'name email role').sort({ createdAt: -1 });res.json(rows.map(d=>{const safe=d.toObject();safe.maskedNic=safe.nicLast4?`********${safe.nicLast4}`:'Not supplied';safe.maskedDrivingLicence=safe.drivingLicenceLast4?`******${safe.drivingLicenceLast4}`:'Not supplied';delete safe.nicLast4;delete safe.drivingLicenceLast4;return safe})); }
  catch (error) { res.status(500).json({ message: 'Error fetching drivers' }); }
};

export const updateDriver = async (req, res) => {
  try {
    const current = await Driver.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Driver not found' });
    const payload = {...driverPayload(req.body, req.file?.filename || current.profileImage || current.image, {
      availability: current.availability, verificationStatus: current.verificationStatus, profileImagePublicId: req.file?.public_id || current.profileImagePublicId,
    }),...(req.body.nic&&req.body.drivingLicence?protectDriverIdentity(req.body):{})};if(req.body.verificationStatus==='verified'&&payload.nicFingerprint)payload.identityVerificationRequired=false;if(current.commissionStanding==='restricted'){if(payload.availability===false)payload.availabilityBeforeRestriction=false;payload.availability=false}
    const driver = await Driver.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (req.file && current.profileImagePublicId) await deleteCloudAsset(current.profileImagePublicId); res.json(driver);
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 400).json({ message: error.name === 'CastError' ? 'Invalid driver ID' : error.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    if (await Booking.exists({ driver: req.params.id, status: { $in: BLOCKING_STATUSES } })) return res.status(409).json({ message: 'Resolve this driver’s active bookings before deletion' });
    const driver = await Driver.findByIdAndUpdate(req.params.id,{accountStatus:'deleted',availability:false,verificationStatus:'suspended'});
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    await deleteCloudAsset(driver.profileImagePublicId); await deleteCloudAsset(driver.vehicleImagePublicId); res.json({ message: 'Driver deleted' });
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid driver ID' : 'Error deleting driver' });
  }
};
export const revealDriverIdentity=async(req,res,next)=>{try{const driver=await Driver.findById(req.params.id).select('+nicEncrypted +drivingLicenceEncrypted');if(!driver)return res.status(404).json({message:'Driver not found'});if(!driver.nicEncrypted)return res.status(404).json({message:'Identity has not been supplied'});await FinancialEvent.create({eventType:'driver_identity_revealed',entityType:'driver',entityId:driver._id,driver:driver._id,actor:req.user});res.json({nic:decryptIdentity(driver.nicEncrypted),drivingLicence:decryptIdentity(driver.drivingLicenceEncrypted)})}catch(e){next(e)}};
export const verifyDriverIdentity=async(req,res,next)=>{try{const driver=await Driver.findById(req.params.id);if(!driver)return res.status(404).json({message:'Driver not found'});const identity=protectDriverIdentity(req.body);Object.assign(driver,identity,{identityVerificationRequired:false,verificationStatus:'verified',availability:driver.commissionStanding!=='restricted'&&req.body.availability!==false&&req.body.availability!=='false'});await driver.save();await FinancialEvent.create({eventType:'driver_identity_verified',entityType:'driver',entityId:driver._id,driver:driver._id,actor:req.user});res.json({message:'Driver identity verified',driver:{_id:driver._id,verificationStatus:driver.verificationStatus,identityVerificationRequired:false}})}catch(e){if(e.code===11000)return res.status(409).json({message:'This identity is already associated with a driver account.'});next(e)}};

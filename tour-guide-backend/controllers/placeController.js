import Place from '../models/Place.js';
import { deleteCloudAsset } from '../services/cloudinaryService.js';
import { dedupePlaceLabels } from '../utils/placeLabels.js';

const list = (value) => (Array.isArray(value) ? value : String(value || '').split(',')).map((item) => item.trim()).filter(Boolean);
export const makeSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const optionalNumber = (value) => value === '' || value === undefined ? undefined : Number(value);
const placePayload = (body, image, current = {}, imagePublicId = '') => ({
  name: body.name?.trim(), slug: makeSlug(body.slug || body.name || ''), image: image || current.image,
  additionalImages: list(body.additionalImages), location: body.location?.trim(), district: body.district?.trim() || '', province: body.province?.trim() || '',
  latitude: optionalNumber(body.latitude), longitude: optionalNumber(body.longitude), shortDescription: body.shortDescription?.trim() || '', description: body.description?.trim() || '',
  tags: list(body.tags).map((x) => x.toLowerCase()), categories: list(body.categories).map((x) => x.toLowerCase()), recommendedDuration: Number(body.recommendedDuration || 1),
  bestTimeToVisit: body.bestTimeToVisit?.trim() || 'Year-round', activities: list(body.activities), isActive: body.isActive === undefined ? (current.isActive ?? true) : body.isActive === true || body.isActive === 'true',
  imagePublicId: imagePublicId || current.imagePublicId || '',
});

export const addPlace = async (req, res) => {
  try {
    const data = placePayload(req.body, req.file?.path || req.file?.filename, {}, req.file?.public_id);
    if (!data.name || !data.image || !data.location) return res.status(400).json({ message: 'Name, image and location are required' });
    res.status(201).json(await Place.create(data));
  } catch (error) { res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? 'A destination with this slug already exists' : error.message }); }
};
export const getPlaces = async (req, res) => {
  try {
    const { q, tag, category } = req.query; const filter = { isActive: { $ne: false } };
    if (tag) filter.tags = tag.toLowerCase(); if (category) filter.categories = category.toLowerCase();
    if (q) filter.$or = ['name', 'location', 'district', 'province', 'tags', 'categories'].map((field) => ({ [field]: { $regex: q, $options: 'i' } }));
    res.json(await Place.find(filter).sort({ name: 1 }));
  } catch { res.status(500).json({ message: 'Error fetching destinations' }); }
};
export const getAllPlacesForAdmin = async (_req, res) => {
  try { res.json(await Place.find().sort({ createdAt: -1 })); } catch { res.status(500).json({ message: 'Error fetching destinations' }); }
};
export const getPlace = async (req, res) => {
  try {
    const place = await Place.findOne({ slug: req.params.slug, isActive: { $ne: false } });
    if (!place) return res.status(404).json({ message: 'Destination not found' });
    const related = await Place.find({ _id: { $ne: place._id }, isActive: { $ne: false }, $or: [{ categories: { $in: place.categories } }, { province: place.province }] }).limit(3);
    const placeData = place.toObject();
    const labels = dedupePlaceLabels(placeData.categories, placeData.tags);
    res.json({ place: { ...placeData, ...labels }, related });
  } catch { res.status(500).json({ message: 'Error fetching destination' }); }
};
export const updatePlace = async (req, res) => {
  try {
    const current = await Place.findById(req.params.id); if (!current) return res.status(404).json({ message: 'Destination not found' });
    const place = await Place.findByIdAndUpdate(current._id, placePayload(req.body, req.file?.path || req.file?.filename, current, req.file?.public_id), { new: true, runValidators: true }); if (req.file && current.imagePublicId) await deleteCloudAsset(current.imagePublicId); res.json(place);
  } catch (error) { res.status(error.name === 'CastError' ? 400 : error.code === 11000 ? 409 : 400).json({ message: error.name === 'CastError' ? 'Invalid destination ID' : error.code === 11000 ? 'A destination with this slug already exists' : error.message }); }
};
export const deletePlace = async (req, res) => {
  try { const place = await Place.findByIdAndDelete(req.params.id); if (!place) return res.status(404).json({ message: 'Destination not found' }); await deleteCloudAsset(place.imagePublicId); res.json({ message: 'Destination deleted' }); }
  catch (error) { res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid destination ID' : 'Error deleting destination' }); }
};

import Favorite from '../models/Favorite.js';
import Place from '../models/Place.js';

export const getFavorites = async (req, res) => res.json(await Favorite.find({ user: req.user }).populate('destination').sort({ createdAt: -1 }));
export const addFavorite = async (req, res) => {
  try {
    if (!await Place.exists({ _id: req.params.destinationId, isActive: { $ne: false } })) return res.status(404).json({ message: 'Destination not found' });
    const favorite = await Favorite.create({ user: req.user, destination: req.params.destinationId });
    res.status(201).json(await favorite.populate('destination'));
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Destination is already saved' });
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid destination ID' : 'Could not save destination' });
  }
};
export const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({ user: req.user, destination: req.params.destinationId });
    if (!favorite) return res.status(404).json({ message: 'Saved destination not found' });
    res.json({ message: 'Destination removed from saved places' });
  } catch (error) { res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid destination ID' : 'Could not remove destination' }); }
};

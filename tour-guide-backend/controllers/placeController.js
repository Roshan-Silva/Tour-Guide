import Place from '../models/Place.js';

// add a new place
export const addPlace = async (req, res) => {
  const { name, location } = req.body;
  const image = req.file?.filename;
  const tags = typeof req.body.tags === 'string'
    ? req.body.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : req.body.tags;

  try {
    if (!name?.trim() || !image || !location?.trim()) {
      return res.status(400).json({ message: 'Name, image and location are required' });
    }
    const place = new Place({ name: name.trim(), image, location: location.trim(), tags });
    await place.save();
    res.status(201).json(place);
  } catch (error) {
    res.status(500).json({ message: 'Error adding place', error });
  }
}

// get places
export const getPlaces = async (req, res) => {
  
    const { tag } = req.query;

    let filter = {};
    if (tag) {
        filter.tags = tag;
    }

    try {
    const places = await Place.find(filter);
    res.status(200).json(places);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching places', error: err.message });
  }
}


export const updatePlace = async (req, res) => {
  const { name, location } = req.body;
  const tags = typeof req.body.tags === 'string'
    ? req.body.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : req.body.tags;
  if (!name?.trim() || !location?.trim()) {
    return res.status(400).json({ message: 'Name and location are required' });
  }
  try {
    const changes = { name: name.trim(), location: location.trim(), tags: Array.isArray(tags) ? tags : [] };
    if (req.file) changes.image = req.file.filename;
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      changes,
      { new: true, runValidators: true },
    );
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.status(200).json(place);
  } catch (err) {
    if (err?.name === 'CastError') return res.status(400).json({ message: 'Invalid place ID' });
    res.status(500).json({ message: 'Error updating place', error: err.message });
  }
};

export const deletePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.status(200).json({ message: 'Place deleted' });
  } catch (err) {
    if (err?.name === 'CastError') return res.status(400).json({ message: 'Invalid place ID' });
    res.status(500).json({ message: 'Error deleting place', error: err.message });
  }
};

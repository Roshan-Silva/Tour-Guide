import Place from '../models/place.js';

// add a new place
export const addPlace = async (req, res) => {
  const { name, image, location, tags } = req.body;

  try {
    const place = new Place({ name, image, location, tags });
    await place.save();
    res.status(201).json(place);
  } catch (error) {
    res.status(500).json({ message: 'Error adding place', error });
  }
}

// get all places
export const getPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    res.status(200).json(places);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching places', error: err.message });
  }
}
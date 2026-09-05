import 'dotenv/config';
import mongoose from 'mongoose';
import Place from '../models/Place.js';
import { makeSlug } from '../controllers/placeController.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
try {
  await mongoose.connect(process.env.MONGODB_URI);
  const places = await Place.find();
  for (const place of places) {
    place.slug ||= makeSlug(place.name);
    place.shortDescription ||= `Discover ${place.name}, one of Sri Lanka’s memorable destinations.`;
    place.description ||= place.shortDescription;
    place.categories ||= []; place.activities ||= []; place.recommendedDuration ||= 1; place.bestTimeToVisit ||= 'Year-round';
    if (place.isActive === undefined) place.isActive = true;
    await place.save();
  }
  await Place.syncIndexes();
  console.log(`Phase 2 migration complete: ${places.length} destinations upgraded.`);
} finally { await mongoose.disconnect(); }

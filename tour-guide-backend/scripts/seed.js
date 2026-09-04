import 'dotenv/config';
import mongoose from 'mongoose';
import Place from '../models/Place.js';
import Driver from '../models/Driver.js';

const places = [
  { name: 'Ella', location: 'Uva Province', image: 'https://images.unsplash.com/photo-1586185113229-2b7b054c4bc8?auto=format&fit=crop&w=1200&q=80', tags: ['mountains', 'hiking', 'scenic'] },
  { name: 'Sigiriya', location: 'Central Province', image: 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?auto=format&fit=crop&w=1200&q=80', tags: ['heritage', 'culture', 'history'] },
  { name: 'Galle Fort', location: 'Southern Province', image: 'https://images.unsplash.com/photo-1579989197111-928f81f0221a?auto=format&fit=crop&w=1200&q=80', tags: ['coast', 'heritage', 'architecture'] },
  { name: 'Arugam Bay', location: 'Eastern Province', image: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=1200&q=80', tags: ['beach', 'surfing', 'sunrise'] },
  { name: 'Yala National Park', location: 'Southern Province', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80', tags: ['wildlife', 'safari', 'nature'] },
  { name: 'Kandy', location: 'Central Province', image: 'https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1200&q=80', tags: ['culture', 'temple', 'city'] },
];

const drivers = [
  { name: 'Kasun Perera', phoneNumber: '+94 77 234 8190', vehicleType: 'Comfort Car', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80', availability: true },
  { name: 'Nimal Fernando', phoneNumber: '+94 71 583 2064', vehicleType: 'Family Van', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', availability: true },
  { name: 'Tharindu Silva', phoneNumber: '+94 76 441 9328', vehicleType: 'SUV', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80', availability: true },
];

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');

try {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const place of places) await Place.findOneAndUpdate({ name: place.name }, place, { upsert: true, new: true });
  for (const driver of drivers) await Driver.findOneAndUpdate({ phoneNumber: driver.phoneNumber }, driver, { upsert: true, new: true });
  console.log(`Seed complete: ${places.length} places and ${drivers.length} drivers are ready.`);
} finally {
  await mongoose.disconnect();
}

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import Place from '../models/Place.js';
import User from '../models/User.js';

const places = [
  { name: 'Ella', location: 'Uva Province', image: 'https://images.unsplash.com/photo-1586185113229-2b7b054c4bc8?auto=format&fit=crop&w=1200&q=80', tags: ['mountains', 'hiking', 'scenic'] },
  { name: 'Sigiriya', location: 'Central Province', image: 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?auto=format&fit=crop&w=1200&q=80', tags: ['heritage', 'culture', 'history'] },
  { name: 'Galle Fort', location: 'Southern Province', image: 'https://images.unsplash.com/photo-1579989197111-928f81f0221a?auto=format&fit=crop&w=1200&q=80', tags: ['coast', 'heritage', 'architecture'] },
];

const driverSeeds = [
  { fullName: 'Kasun Perera', email: 'kasun.driver@example.com', phoneNumber: '+94 77 234 8190', vehicleType: 'Comfort Car', vehicleModel: 'Toyota Prius', vehicleCapacity: 3, dailyRate: 12000, languages: ['Sinhala', 'English'], serviceAreas: ['Ella', 'Kandy', 'Colombo'], yearsOfExperience: 7, profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80' },
  { fullName: 'Nimal Fernando', email: 'nimal.driver@example.com', phoneNumber: '+94 71 583 2064', vehicleType: 'Family Van', vehicleModel: 'Toyota KDH', vehicleCapacity: 7, dailyRate: 18000, languages: ['Sinhala', 'English', 'Tamil'], serviceAreas: ['Island-wide'], yearsOfExperience: 11, profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80' },
];

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
if (!process.env.SEED_DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD.length < 8) throw new Error('SEED_DEMO_PASSWORD with at least 8 characters is required');

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const password = await bcrypt.hash(process.env.SEED_DEMO_PASSWORD, 10);
  for (const place of places) await Place.findOneAndUpdate({ name: place.name }, place, { upsert: true, new: true });
  await User.findOneAndUpdate({ email: 'traveler@example.com' }, { name: 'Demo Traveler', email: 'traveler@example.com', password, role: 'traveler' }, { upsert: true, runValidators: true });
  for (const seed of driverSeeds) {
    const user = await User.findOneAndUpdate({ email: seed.email }, { name: seed.fullName, email: seed.email, password, role: 'driver' }, { upsert: true, new: true, runValidators: true });
    await Driver.findOneAndUpdate({ user: user._id }, {
      ...seed, user: user._id, name: seed.fullName, image: seed.profileImage, bio: `Experienced local driver specialising in ${seed.serviceAreas.join(', ')}.`,
      availability: true, verificationStatus: 'verified', averageRating: 0, reviewCount: 0,
    }, { upsert: true, new: true, runValidators: true });
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD?.length >= 12) {
    await User.findOneAndUpdate({ email: process.env.ADMIN_EMAIL.toLowerCase() }, { name: process.env.ADMIN_NAME || 'Ceylon Explorer Admin', email: process.env.ADMIN_EMAIL.toLowerCase(), password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin' }, { upsert: true, runValidators: true });
  }
  console.log(`Seed complete: ${places.length} places, one traveler, and ${driverSeeds.length} linked drivers are ready.`);
} finally {
  await mongoose.disconnect();
}

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import Place from '../models/Place.js';
import User from '../models/User.js';

const places = [
  { name: 'Ella', slug: 'ella', location: 'Ella, Badulla', district: 'Badulla', province: 'Uva', latitude: 6.8667, longitude: 81.0466, image: 'https://images.unsplash.com/photo-1586185113229-2b7b054c4bc8?auto=format&fit=crop&w=1200&q=80', shortDescription: 'Tea-covered hills, iconic railways, and rewarding sunrise hikes.', description: 'Ella is a relaxed hill-country town surrounded by cloud forests, tea estates, waterfalls, and memorable railway scenery.', tags: ['mountains', 'hiking', 'scenic', 'photography'], categories: ['nature', 'hiking', 'adventure'], recommendedDuration: 2, bestTimeToVisit: 'January to March', activities: ['Nine Arches Bridge', 'Little Adam’s Peak', 'Tea plantation visit'], isActive: true },
  { name: 'Sigiriya', slug: 'sigiriya', location: 'Sigiriya, Matale', district: 'Matale', province: 'Central', latitude: 7.957, longitude: 80.7603, image: 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?auto=format&fit=crop&w=1200&q=80', shortDescription: 'An ancient rock citadel rising above the central plains.', description: 'Climb the UNESCO-listed Lion Rock, encounter ancient frescoes, and explore sophisticated water gardens.', tags: ['heritage', 'culture', 'history', 'photography'], categories: ['culture', 'history', 'adventure'], recommendedDuration: 1, bestTimeToVisit: 'January to April', activities: ['Sigiriya Rock Fortress', 'Pidurangala sunrise', 'Village experience'], isActive: true },
  { name: 'Galle Fort', slug: 'galle-fort', location: 'Galle', district: 'Galle', province: 'Southern', latitude: 6.026, longitude: 80.217, image: 'https://images.unsplash.com/photo-1579989197111-928f81f0221a?auto=format&fit=crop&w=1200&q=80', shortDescription: 'Ocean ramparts, layered history, and atmospheric streets.', description: 'Galle Fort blends Dutch colonial architecture, local neighborhoods, galleries, cafés, and sunset walks along old sea walls.', tags: ['beaches', 'heritage', 'architecture', 'relaxation'], categories: ['culture', 'history', 'beaches'], recommendedDuration: 1, bestTimeToVisit: 'December to April', activities: ['Fort rampart walk', 'Maritime museum', 'Sunset at the lighthouse'], isActive: true },
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

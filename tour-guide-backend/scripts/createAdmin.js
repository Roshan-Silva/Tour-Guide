import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';

const { ADMIN_NAME = 'Ceylon Explorer Admin', ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;

if (!MONGODB_URI) throw new Error('MONGODB_URI is required');
if (!ADMIN_EMAIL) throw new Error('ADMIN_EMAIL is required');
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');

try {
  await mongoose.connect(MONGODB_URI);
  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.trim().toLowerCase() },
    { name: ADMIN_NAME.trim(), email: ADMIN_EMAIL.trim().toLowerCase(), password, role: 'admin' },
    { upsert: true, new: true, runValidators: true },
  );
  console.log(`Admin account ready for ${admin.email}`);
} finally {
  await mongoose.disconnect();
}

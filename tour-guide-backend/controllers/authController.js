import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import User from '../models/User.js';

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set in the environment variables');
  return process.env.JWT_SECRET;
};

const sessionPayload = (user) => ({
  token: jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: '2d' }),
  user: { id: user._id, name: user.name, email: user.email, role: user.role },
});

export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (confirmPassword !== undefined && password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), role: 'traveler' });
    res.status(201).json({ message: 'User registered successfully', ...sessionPayload(user) });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email?.trim() || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({ message: 'Login successful', ...sessionPayload(user) });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

export const registerDriver = async (req, res) => {
  const { name, email, password, confirmPassword, phoneNumber, vehicleType, vehicleModel, vehicleCapacity, dailyRate, languages = '', serviceAreas = '', yearsOfExperience = 0, bio = '' } = req.body;
  if (!name?.trim() || !email?.trim() || !phoneNumber?.trim() || !vehicleType?.trim() || !req.file) return res.status(400).json({ message: 'Name, email, phone, vehicle type and profile image are required' });
  if (!password || password.length < 8 || password !== confirmPassword) return res.status(400).json({ message: password !== confirmPassword ? 'Passwords do not match' : 'Password must be at least 8 characters' });
  const session = await mongoose.startSession();
  try {
    let user;
    let driver;
    await session.withTransaction(async () => {
      const normalizedEmail = email.trim().toLowerCase();
      if (await User.findOne({ email: normalizedEmail }).session(session)) throw new Error('User already exists');
      [user] = await User.create([{ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), role: 'driver' }], { session });
      [driver] = await Driver.create([{
        user: user._id, fullName: name.trim(), name: name.trim(), phoneNumber: phoneNumber.trim(), profileImage: req.file.filename, image: req.file.filename,
        vehicleType: vehicleType.trim(), vehicleModel: vehicleModel?.trim() || '', vehicleCapacity: Number(vehicleCapacity || 4), dailyRate: Number(dailyRate || 0),
        yearsOfExperience: Number(yearsOfExperience || 0), bio: bio.trim(), languages: languages.split(',').map((value) => value.trim()).filter(Boolean),
        serviceAreas: serviceAreas.split(',').map((value) => value.trim()).filter(Boolean), availability: false, verificationStatus: 'pending',
      }], { session });
    });
    res.status(201).json({ message: 'Driver application submitted for verification', ...sessionPayload(user), driver });
  } catch (error) {
    const isKnown = error.message === 'User already exists' || error.name === 'ValidationError';
    res.status(isKnown ? 400 : 500).json({ message: isKnown ? error.message : 'Driver registration failed' });
  } finally {
    await session.endSession();
  }
};

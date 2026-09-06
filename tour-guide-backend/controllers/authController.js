import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const secret = (name) => { if (!process.env[name]) throw Object.assign(new Error(`${name} is not configured`), { status: 500 }); return process.env[name]; };
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const refreshDays = Number(process.env.REFRESH_TOKEN_DAYS || 7);
const cookieOptions = { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', secure: process.env.NODE_ENV === 'production', path: '/api/auth', maxAge: refreshDays * 86400000 };
const clearCookieOptions = { httpOnly: cookieOptions.httpOnly, sameSite: cookieOptions.sameSite, secure: cookieOptions.secure, path: cookieOptions.path };
const accessToken = (user) => jwt.sign({ id: user._id, role: user.role }, secret('JWT_SECRET'), { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' });
const issueSession = async (user, res) => {
  const refresh = jwt.sign({ id: user._id, type: 'refresh', nonce: crypto.randomBytes(16).toString('hex') }, secret('JWT_REFRESH_SECRET'), { expiresIn: `${refreshDays}d` });
  user.refreshTokenHash = hashToken(refresh); user.refreshTokenExpiresAt = new Date(Date.now() + refreshDays * 86400000); await user.save({ validateBeforeSave: false });
  res.cookie('refreshToken', refresh, cookieOptions); return { token: accessToken(user), user: publicUser(user) };
};

export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (confirmPassword !== undefined && password !== confirmPassword) return res.status(422).json({ success: false, message: 'Passwords do not match', errors: [{ field: 'confirmPassword', message: 'Passwords do not match' }] });
  if (await User.exists({ email })) return res.status(409).json({ success: false, message: 'An account already exists with this email', errors: [] });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: 'traveler' });
  const session = await issueSession(user, res); res.status(201).json({ success: true, message: 'Account created successfully', data: session, ...session });
};

export const loginUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password +refreshTokenHash +refreshTokenExpiresAt');
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password', errors: [] });
  const session = await issueSession(user, res); res.json({ success: true, message: 'Login successful', data: session, ...session });
};

export const refreshSession = async (req, res) => {
  const token = req.cookies?.refreshToken; if (!token) return res.status(401).json({ success: false, message: 'Refresh session is missing', errors: [] });
  const decoded = jwt.verify(token, secret('JWT_REFRESH_SECRET')); if (decoded.type !== 'refresh') return res.status(401).json({ success: false, message: 'Invalid refresh session', errors: [] });
  const user = await User.findById(decoded.id).select('+refreshTokenHash +refreshTokenExpiresAt');
  if (!user || user.refreshTokenHash !== hashToken(token) || user.refreshTokenExpiresAt < new Date()) return res.status(401).json({ success: false, message: 'Refresh session is invalid or expired', errors: [] });
  const session = await issueSession(user, res); res.json({ success: true, message: 'Session refreshed', data: session, ...session });
};
export const logoutUser = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) { try { const decoded = jwt.verify(token, secret('JWT_REFRESH_SECRET')); await User.findByIdAndUpdate(decoded.id, { $unset: { refreshTokenHash: 1, refreshTokenExpiresAt: 1 } }); } catch { /* Always complete logout. */ } }
  res.clearCookie('refreshToken', clearCookieOptions); res.json({ success: true, message: 'Logged out', data: null });
};

export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordResetTokenHash +passwordResetExpiresAt'); let developmentToken;
  if (user) { const token = crypto.randomBytes(32).toString('hex'); user.passwordResetTokenHash = hashToken(token); user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60000); await user.save({ validateBeforeSave: false }); const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`; await sendPasswordResetEmail({ email: user.email, resetUrl, token }); if (process.env.NODE_ENV !== 'production' && process.env.EXPOSE_RESET_TOKEN === 'true') developmentToken = token; }
  res.json({ success: true, message: 'If that email is registered, password reset instructions have been prepared.', data: developmentToken ? { developmentToken } : null });
};
export const resetPassword = async (req, res) => {
  const user = await User.findOne({ passwordResetTokenHash: hashToken(req.params.token), passwordResetExpiresAt: { $gt: new Date() } }).select('+passwordResetTokenHash +passwordResetExpiresAt +refreshTokenHash +refreshTokenExpiresAt');
  if (!user) return res.status(400).json({ success: false, message: 'Reset link is invalid or expired', errors: [] });
  user.password = await bcrypt.hash(req.body.password, 12); user.passwordResetTokenHash = undefined; user.passwordResetExpiresAt = undefined; user.refreshTokenHash = undefined; user.refreshTokenExpiresAt = undefined; await user.save();
  res.clearCookie('refreshToken', clearCookieOptions); res.json({ success: true, message: 'Password reset successfully', data: null });
};
export const getMe = async (req, res) => { const user = await User.findById(req.user); if (!user) return res.status(404).json({ success: false, message: 'Account not found', errors: [] }); res.json({ success: true, message: 'Profile loaded', data: publicUser(user) }); };
export const updateMe = async (req, res) => { const user = await User.findByIdAndUpdate(req.user, { name: req.body.name.trim() }, { new: true, runValidators: true }); if (!user) return res.status(404).json({ success: false, message: 'Account not found', errors: [] }); res.json({ success: true, message: 'Profile updated', data: publicUser(user) }); };

export const registerDriver = async (req, res) => {
  const { name, email, password, confirmPassword, phoneNumber, vehicleType, vehicleModel, vehicleCapacity, dailyRate, languages = '', serviceAreas = '', yearsOfExperience = 0, bio = '' } = req.body;
  if (!name?.trim() || !email?.trim() || !phoneNumber?.trim() || !vehicleType?.trim() || !req.file) return res.status(422).json({ success: false, message: 'Name, email, phone, vehicle type and profile image are required', errors: [] });
  if (!password || password.length < 8 || password !== confirmPassword) return res.status(422).json({ success: false, message: password !== confirmPassword ? 'Passwords do not match' : 'Password must be at least 8 characters', errors: [] });
  const session = await mongoose.startSession(); let user; let driver;
  try { await session.withTransaction(async () => { const normalizedEmail = email.trim().toLowerCase(); if (await User.exists({ email: normalizedEmail }).session(session)) throw Object.assign(new Error('An account already exists with this email'), { status: 409 }); [user] = await User.create([{ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), role: 'driver' }], { session }); const image = req.file.path || req.file.filename; [driver] = await Driver.create([{ user: user._id, fullName: name.trim(), name: name.trim(), phoneNumber: phoneNumber.trim(), profileImage: image, image, profileImagePublicId: req.file.public_id || '', vehicleType: vehicleType.trim(), vehicleModel: vehicleModel?.trim() || '', vehicleCapacity: Number(vehicleCapacity || 4), dailyRate: Number(dailyRate || 0), yearsOfExperience: Number(yearsOfExperience || 0), bio: bio.trim(), languages: String(languages).split(',').map((x) => x.trim()).filter(Boolean), serviceAreas: String(serviceAreas).split(',').map((x) => x.trim()).filter(Boolean), availability: false, verificationStatus: 'pending' }], { session }); }); const auth = await issueSession(user, res); res.status(201).json({ success: true, message: 'Driver application submitted for verification', data: { ...auth, driver }, ...auth, driver }); }
  finally { await session.endSession(); }
};

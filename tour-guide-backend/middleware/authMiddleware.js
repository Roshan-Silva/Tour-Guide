import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// if(!process.env.JWT_SECRET) {
//   throw new Error("JWT_SECRET is not set in the environment variables");
// }

export const protect = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Server authentication is not configured' });
    }
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
}

export const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.user).select('role');
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Administrator access required' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Could not verify administrator access' });
    }
};

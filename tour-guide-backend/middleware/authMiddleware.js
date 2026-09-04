import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const isRoleAuthorized = (actualRole, allowedRoles) => allowedRoles.includes(actualRole);

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
        req.userRole = decoded.role;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
}

export const authorizeRoles = (...roles) => async (req, res, next) => {
    try {
        const user = await User.findById(req.user).select('role');
        if (!user || !isRoleAuthorized(user.role, roles)) {
            return res.status(403).json({ message: `Access requires one of these roles: ${roles.join(', ')}` });
        }
        req.userRole = user.role;
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Could not verify account permissions' });
    }
};

export const adminOnly = authorizeRoles('admin');

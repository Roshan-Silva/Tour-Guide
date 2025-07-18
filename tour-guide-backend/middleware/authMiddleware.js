import jwt from 'jsonwebtoken';

// if(!process.env.JWT_SECRET) {
//   throw new Error("JWT_SECRET is not set in the environment variables");
// }

const JWT_SECRET = process.env.JWT_SECRET || "ndiuyenddgy256bvdh";

export const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.userId;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
}

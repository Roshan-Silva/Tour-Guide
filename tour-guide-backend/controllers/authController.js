import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || "ndiuyenddgy256bvdh";
// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET is not set in the environment variables");
// }

export const registerUser = async (req, res) =>{
    const {name, email, password} = req.body;
    try {
        // Check if user already exists
        const existing = await User.findOne({ email });
        if(existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

    export const loginUser = async (req, res) =>{

        const { email, password} = req.body;
        try {
            // Find the user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'user not found' });
            }

            // Check the password
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(400).json({ message: 'Invalid credintials' });
            }

            // Create a JWT token
            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2d' });

            res.status(200).json({ 
                message: 'Login successful', 
                token, 
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                } 
            });
        } catch (err) {
            res.status(500).json({ message: 'Login failed', error: err.message });
        }

    }


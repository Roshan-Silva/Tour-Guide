import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set in the environment variables');
    }
    return process.env.JWT_SECRET;
};

export const registerUser = async (req, res) =>{
    const { name, email, password, confirmPassword } = req.body;
    try {
        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }
        if (confirmPassword !== undefined && password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const normalizedEmail = email.trim().toLowerCase();
        // Check if user already exists
        const existing = await User.findOne({ email: normalizedEmail });
        if(existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        // Save the user to the database
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: '2d' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

    export const loginUser = async (req, res) =>{

        const { email, password} = req.body;
        try {
            if (!email?.trim() || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }
            // Find the user by email
            const user = await User.findOne({ email: email.trim().toLowerCase() });
            if (!user) {
                return res.status(400).json({ message: 'user not found' });
            }

            // Check the password
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Create a JWT token
            const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: '2d' });

            res.status(200).json({ 
                message: 'Login successful', 
                token, 
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                } 
            });
        } catch (err) {
            res.status(500).json({ message: 'Login failed', error: err.message });
        }

    }


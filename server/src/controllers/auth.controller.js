import { User } from '../models/user.model.js';
import { generateToken } from '../middleware/auth.middleware.js';

const normalizeEmail = (value = '') => value.trim().toLowerCase();

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name: rawName, email: rawEmail, password, age, gender } = req.body;
    const name = rawName?.trim();
    const email = normalizeEmail(rawEmail);
    console.log('Register attempt:', { name, email, age, gender });

    const userExists = await User.findOne({ email });
    console.log('User exists check:', userExists ? 'Found user' : 'No user found');
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      age,
      gender
    });
    console.log('User created:', user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);

    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = normalizeEmail(rawEmail);
    console.log('Login attempt:', { email });

    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Stored password hash:', user.password ? 'Present' : 'Missing');
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        streak: user.streak,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

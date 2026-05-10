import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const DEMO_TOKEN_PREFIX = 'demo-token:';

const normalizeEmail = (value = '') => value.trim().toLowerCase();

const buildDemoUserPayload = (email) => {
  const localPart = email.split('@')[0] || 'mindcare-user';
  const safeName = localPart
    .replace(/[._-]+/g, ' ')
    .trim()
    .slice(0, 50);

  return {
    name: safeName || 'MindCare User',
    email,
    password: `demo-${Date.now()}`
  };
};

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    if (process.env.NODE_ENV !== 'production' && token.startsWith(DEMO_TOKEN_PREFIX)) {
      const email = normalizeEmail(token.slice(DEMO_TOKEN_PREFIX.length));

      if (!email) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, demo token failed'
        });
      }

      let user = await User.findOne({ email }).select('-password');

      if (!user) {
        user = await User.create(buildDemoUserPayload(email));
        user = await User.findById(user._id).select('-password');
      }

      req.user = user;
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

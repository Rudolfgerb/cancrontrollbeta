import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ERROR_MESSAGES } from '../config/constants.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: ERROR_MESSAGES.AUTH.UNAUTHORIZED,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: ERROR_MESSAGES.AUTH.UNAUTHORIZED,
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: ERROR_MESSAGES.AUTH.TOKEN_INVALID,
    });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }
};

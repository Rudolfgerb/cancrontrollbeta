import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Player from '../models/Player.js';
import { GAME_CONSTANTS } from '../config/constants.js';

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Create player profile
    const player = await Player.create({
      userId: user._id,
      username: user.username,
      inventory: {
        tools: [
          {
            toolId: 'spray_can',
            durability: 100,
            capacity: 100,
          }
        ],
        colors: [
          { colorId: 'black', quantity: 100 },
          { colorId: 'white', quantity: 100 },
        ],
      },
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.getPublicProfile(),
      player: {
        id: player._id,
        money: player.money,
        reputation: player.reputation,
        level: player.level,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Get player data
    const player = await Player.findOne({ userId: user._id });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.getPublicProfile(),
      player: player ? {
        id: player._id,
        money: player.money,
        reputation: player.reputation,
        level: player.level,
        jailStatus: player.jailStatus,
      } : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

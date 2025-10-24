import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import gameService from '../services/game.service.js';
import Player from '../models/Player.js';
import Spot from '../models/Spot.js';
import { GAME_CONSTANTS } from '../config/constants.js';

const router = express.Router();

// @route   POST /api/game/risk-event
// @desc    Generate random risk event
// @access  Private
router.post('/risk-event', protect, async (req, res) => {
  try {
    const event = gameService.generateRiskEvent();

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/game/calculate-risk
// @desc    Calculate current risk for spot
// @access  Private
router.post('/calculate-risk', protect, async (req, res) => {
  try {
    const { spotId, activeModifiers = [] } = req.body;

    const spot = await Spot.findById(spotId);

    if (!spot) {
      return res.status(404).json({
        success: false,
        error: 'Spot not found',
      });
    }

    const drainRate = gameService.calculateStealthDrainRate(spot, activeModifiers);

    res.json({
      success: true,
      drainRate,
      currentRisk: spot.calculateRisk(new Date().getHours()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/game/arrest
// @desc    Process player arrest
// @access  Private
router.post('/arrest', protect, async (req, res) => {
  try {
    const { spotId } = req.body;

    const player = await Player.findOne({ userId: req.user._id });

    const result = await gameService.processArrest(player._id, spotId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/game/escape
// @desc    Process successful escape
// @access  Private
router.post('/escape', protect, async (req, res) => {
  try {
    const player = await Player.findOne({ userId: req.user._id });

    const result = await gameService.processEscape(player._id);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/game/constants
// @desc    Get game constants
// @access  Public
router.get('/constants', (req, res) => {
  res.json({
    success: true,
    constants: GAME_CONSTANTS,
  });
});

export default router;

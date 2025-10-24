import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Player from '../models/Player.js';
import { GAME_CONSTANTS } from '../config/constants.js';

const router = express.Router();

// @route   GET /api/player/profile
// @desc    Get player profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const player = await Player.findOne({ userId: req.user._id });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found',
      });
    }

    // Check jail status
    player.checkJailStatus();
    await player.save();

    res.json({
      success: true,
      player,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/player/inventory
// @desc    Get player inventory
// @access  Private
router.get('/inventory', protect, async (req, res) => {
  try {
    const player = await Player.findOne({ userId: req.user._id });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found',
      });
    }

    res.json({
      success: true,
      inventory: player.inventory,
      activeTools: player.getActiveTools(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/player/buy-tool
// @desc    Purchase a tool
// @access  Private
router.post('/buy-tool', protect, async (req, res) => {
  try {
    const { toolId } = req.body;

    const player = await Player.findOne({ userId: req.user._id });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found',
      });
    }

    const toolData = GAME_CONSTANTS.TOOLS[toolId.toUpperCase()];

    if (!toolData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tool',
      });
    }

    if (player.money < toolData.cost) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
      });
    }

    player.deductMoney(toolData.cost);
    const newTool = player.addTool(toolData.id);
    await player.save();

    res.json({
      success: true,
      tool: newTool,
      remainingMoney: player.money,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/player/buy-color
// @desc    Purchase color
// @access  Private
router.post('/buy-color', protect, async (req, res) => {
  try {
    const { colorId, quantity = 100 } = req.body;

    const player = await Player.findOne({ userId: req.user._id });

    const colorData = GAME_CONSTANTS.COLORS.find(c => c.id === colorId);

    if (!colorData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid color',
      });
    }

    const totalCost = colorData.cost * (quantity / 100);

    if (player.money < totalCost) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
      });
    }

    player.deductMoney(totalCost);

    const existingColor = player.inventory.colors.find(c => c.colorId === colorId);

    if (existingColor) {
      existingColor.quantity += quantity;
    } else {
      player.inventory.colors.push({ colorId, quantity });
    }

    await player.save();

    res.json({
      success: true,
      remainingMoney: player.money,
      colors: player.inventory.colors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/player/stats
// @desc    Get player stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const player = await Player.findOne({ userId: req.user._id });

    res.json({
      success: true,
      stats: player.stats,
      level: player.level,
      experience: player.experience,
      reputation: player.reputation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

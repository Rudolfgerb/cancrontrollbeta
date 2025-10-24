import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { protect } from '../middleware/auth.middleware.js';
import Graffiti from '../models/Graffiti.js';
import Player from '../models/Player.js';
import Spot from '../models/Spot.js';

const router = express.Router();

// @route   POST /api/graffiti/start
// @desc    Start new graffiti session
// @access  Private
router.post('/start', protect, async (req, res) => {
  try {
    const { spotId, backgroundImage, canvasData } = req.body;

    const player = await Player.findOne({ userId: req.user._id });
    const spot = await Spot.findById(spotId);

    if (!spot) {
      return res.status(404).json({
        success: false,
        error: 'Spot not found',
      });
    }

    // Check if player can paint
    if (player.jailStatus.isInJail) {
      return res.status(403).json({
        success: false,
        error: 'Cannot paint while in jail',
      });
    }

    if (!spot.canBePainted()) {
      return res.status(400).json({
        success: false,
        error: 'Spot cannot be painted yet',
      });
    }

    const graffiti = await Graffiti.create({
      graffitiId: uuidv4(),
      spotId: spot._id,
      playerId: player._id,
      backgroundImage,
      canvasData,
      paintingSession: {
        startTime: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      graffiti,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   PUT /api/graffiti/:id/stroke
// @desc    Add stroke to graffiti
// @access  Private
router.put('/:id/stroke', protect, async (req, res) => {
  try {
    const { stroke } = req.body;

    const graffiti = await Graffiti.findOne({ graffitiId: req.params.id });

    if (!graffiti) {
      return res.status(404).json({
        success: false,
        error: 'Graffiti not found',
      });
    }

    graffiti.strokes.push(stroke);
    await graffiti.save();

    res.json({
      success: true,
      strokeCount: graffiti.strokes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/graffiti/:id/complete
// @desc    Complete graffiti session
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const { finalImage, wasSuccessful, escaped } = req.body;

    const graffiti = await Graffiti.findOne({ graffitiId: req.params.id });

    if (!graffiti) {
      return res.status(404).json({
        success: false,
        error: 'Graffiti not found',
      });
    }

    graffiti.finalImage = finalImage;
    graffiti.paintingSession.endTime = new Date();
    graffiti.paintingSession.duration = Math.floor(
      (graffiti.paintingSession.endTime - graffiti.paintingSession.startTime) / 1000
    );
    graffiti.paintingSession.escapedPolice = escaped;
    graffiti.isPainted = wasSuccessful;
    graffiti.completedAt = new Date();

    const spot = await Spot.findById(graffiti.spotId);
    const complexity = graffiti.calculateComplexity();
    const score = graffiti.calculateScore(spot);

    await graffiti.save();

    res.json({
      success: true,
      graffiti,
      score,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/graffiti/gallery
// @desc    Get graffiti gallery
// @access  Public
router.get('/gallery', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const graffitis = await Graffiti.find({ isPainted: true, isPublic: true })
      .sort({ 'stats.score': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('playerId', 'username')
      .populate('spotId', 'location spotType');

    const count = await Graffiti.countDocuments({ isPainted: true, isPublic: true });

    res.json({
      success: true,
      graffitis,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

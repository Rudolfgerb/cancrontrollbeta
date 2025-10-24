import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { protect } from '../middleware/auth.middleware.js';
import Spot from '../models/Spot.js';
import streetViewService from '../services/streetview.service.js';
import { GAME_CONSTANTS } from '../config/constants.js';

const router = express.Router();

// @route   GET /api/spots/nearby
// @desc    Get spots near location
// @access  Private
router.get('/nearby', protect, async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude required',
      });
    }

    const spots = await Spot.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));

    res.json({
      success: true,
      count: spots.length,
      spots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/spots/generate
// @desc    Generate spots for a location
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const { lat, lng, count = 10 } = req.body;

    const randomSpots = streetViewService.generateRandomSpots(
      parseFloat(lat),
      parseFloat(lng),
      count
    );

    const createdSpots = [];

    for (const spotData of randomSpots) {
      // Get address info
      const addressInfo = await streetViewService.reverseGeocode(spotData.lat, spotData.lng);

      // Get population density
      const densityInfo = await streetViewService.getPopulationDensity(spotData.lat, spotData.lng);

      // Calculate risk
      const spotTypeData = Object.values(GAME_CONSTANTS.SPOT_TYPES).find(
        st => st.name === spotData.spotType
      );

      const riskFactor = spotTypeData.riskFactor * (0.8 + densityInfo.density * 0.4);

      const spot = await Spot.create({
        spotId: uuidv4(),
        location: {
          lat: spotData.lat,
          lng: spotData.lng,
          address: addressInfo.address || 'Unknown',
          city: addressInfo.city || 'Unknown',
          country: addressInfo.country || 'Unknown',
        },
        spotType: spotData.spotType,
        riskFactor: Math.min(riskFactor, 1.0),
        baseScoreValue: spotTypeData.baseScore,
        streetViewMetadata: {
          heading: spotData.heading,
          pitch: 0,
          zoom: 1,
        },
        discoveredBy: req.user._id,
      });

      createdSpots.push(spot);
    }

    res.status(201).json({
      success: true,
      count: createdSpots.length,
      spots: createdSpots,
    });
  } catch (error) {
    console.error('Error generating spots:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/spots/:id
// @desc    Get single spot
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id)
      .populate('currentGraffiti')
      .populate('owningPlayerId', 'username');

    if (!spot) {
      return res.status(404).json({
        success: false,
        error: 'Spot not found',
      });
    }

    res.json({
      success: true,
      spot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/spots/:id/streetview
// @desc    Get Street View image for spot
// @access  Private
router.get('/:id/streetview', protect, async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);

    if (!spot) {
      return res.status(404).json({
        success: false,
        error: 'Spot not found',
      });
    }

    const location = `${spot.location.lat},${spot.location.lng}`;
    const heading = spot.streetViewMetadata.heading || 0;

    const panorama = await streetViewService.getPanorama(location, {
      heading,
      size: '1024x768',
    });

    if (!panorama.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch Street View image',
      });
    }

    res.json({
      success: true,
      image: panorama.image,
      metadata: panorama.metadata,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

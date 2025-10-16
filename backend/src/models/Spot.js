import mongoose from 'mongoose';
import { GAME_CONSTANTS } from '../config/constants.js';

const spotSchema = new mongoose.Schema({
  spotId: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    address: String,
    city: String,
    country: String,
  },
  spotType: {
    type: String,
    required: true,
    enum: ['wall', 'electrical_box', 'bridge', 'train', 'billboard'],
    default: 'wall',
  },
  riskFactor: {
    type: Number,
    required: true,
    min: 0.1,
    max: 1.0,
    default: 0.5,
  },
  baseScoreValue: {
    type: Number,
    required: true,
    default: 100,
  },
  currentGraffiti: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Graffiti',
  },
  owningPlayerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
  owningCrewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crew',
  },
  lastPainted: {
    type: Date,
  },
  paintCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  streetViewMetadata: {
    panoramaId: String,
    heading: Number,
    pitch: Number,
    zoom: Number,
    imageUrl: String,
  },
  discoveredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for geospatial queries
spotSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Method to calculate risk based on time and location
spotSchema.methods.calculateRisk = function(currentHour) {
  let risk = this.riskFactor;

  // Time factor (higher risk during day)
  if (currentHour >= 6 && currentHour <= 18) {
    risk *= 1.5; // Day
  } else if (currentHour >= 19 && currentHour <= 21) {
    risk *= 1.2; // Evening
  } else {
    risk *= 0.8; // Night
  }

  return Math.min(risk, 1.0);
};

// Method to check if spot can be painted
spotSchema.methods.canBePainted = function() {
  if (!this.isActive) return false;

  // Check if enough time has passed since last paint (cooldown period)
  if (this.lastPainted) {
    const cooldownHours = 24;
    const timeSinceLastPaint = Date.now() - this.lastPainted.getTime();
    const cooldownMs = cooldownHours * 60 * 60 * 1000;

    if (timeSinceLastPaint < cooldownMs) {
      return false;
    }
  }

  return true;
};

// Static method to find spots near a location
spotSchema.statics.findNearby = function(lat, lng, radiusInKm = 5) {
  // Simple distance calculation (for production, use MongoDB geospatial queries)
  const toRad = (num) => (num * Math.PI) / 180;

  return this.find({ isActive: true }).then(spots => {
    return spots.filter(spot => {
      const R = 6371; // Earth's radius in km
      const dLat = toRad(spot.location.lat - lat);
      const dLon = toRad(spot.location.lng - lng);

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat)) * Math.cos(toRad(spot.location.lat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance <= radiusInKm;
    });
  });
};

const Spot = mongoose.model('Spot', spotSchema);

export default Spot;

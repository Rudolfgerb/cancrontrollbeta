import mongoose from 'mongoose';

const brushStrokeSchema = new mongoose.Schema({
  strokeId: {
    type: String,
    required: true,
  },
  brushType: {
    type: String,
    required: true,
  },
  points: [{
    x: Number,
    y: Number,
  }],
  color: {
    type: String,
    required: true,
  },
  strokeSize: {
    type: Number,
    required: true,
  },
  opacity: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 1,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const graffitiSchema = new mongoose.Schema({
  graffitiId: {
    type: String,
    required: true,
    unique: true,
  },
  spotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spot',
    required: true,
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  crewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crew',
  },
  title: {
    type: String,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  backgroundImage: {
    type: String,
    required: true, // Street View image
  },
  canvasData: {
    width: Number,
    height: Number,
    cropArea: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
  },
  strokes: [brushStrokeSchema],
  finalImage: {
    type: String, // Base64 or URL to stored image
  },
  paintingSession: {
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds
    stealthEvents: [{
      eventType: String,
      timestamp: Date,
      impact: Number,
    }],
    wasInterrupted: Boolean,
    escapedPolice: Boolean,
  },
  stats: {
    score: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    complexity: {
      type: Number, // Based on stroke count and variety
      default: 0,
    },
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true,
  },
  isPainted: {
    type: Boolean,
    default: false, // True when completed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Calculate complexity based on strokes
graffitiSchema.methods.calculateComplexity = function() {
  const strokeCount = this.strokes.length;
  const colorVariety = new Set(this.strokes.map(s => s.color)).size;
  const brushVariety = new Set(this.strokes.map(s => s.brushType)).size;

  this.stats.complexity = (strokeCount * 0.5) + (colorVariety * 10) + (brushVariety * 15);
  return this.stats.complexity;
};

// Calculate score based on multiple factors
graffitiSchema.methods.calculateScore = function(spot) {
  const complexity = this.stats.complexity || this.calculateComplexity();
  const duration = this.paintingSession.duration || 0;
  const riskBonus = spot ? spot.riskFactor * 100 : 0;
  const escapeBonus = this.paintingSession.escapedPolice ? 200 : 0;

  this.stats.score = Math.floor(
    complexity + riskBonus + escapeBonus + (duration / 10)
  );

  return this.stats.score;
};

// Increment views
graffitiSchema.methods.addView = function() {
  this.stats.views += 1;
  return this.save();
};

// Increment likes
graffitiSchema.methods.addLike = function() {
  this.stats.likes += 1;
  return this.save();
};

graffitiSchema.index({ playerId: 1, createdAt: -1 });
graffitiSchema.index({ spotId: 1 });
graffitiSchema.index({ 'stats.score': -1 });

const Graffiti = mongoose.model('Graffiti', graffitiSchema);

export default Graffiti;

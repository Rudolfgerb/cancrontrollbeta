import mongoose from 'mongoose';
import { GAME_CONSTANTS } from '../config/constants.js';

const toolSchema = new mongoose.Schema({
  toolId: {
    type: String,
    required: true,
  },
  durability: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  capacity: {
    type: Number,
    default: 100,
    min: 0,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

const arrestRecordSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  spotId: {
    type: String,
    required: true,
  },
  fineAmount: {
    type: Number,
    required: true,
  },
  location: {
    lat: Number,
    lng: Number,
  },
});

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  money: {
    type: Number,
    default: 500, // Starting money
    min: 0,
  },
  reputation: {
    type: Number,
    default: 0,
    min: GAME_CONSTANTS.REPUTATION.MIN,
    max: GAME_CONSTANTS.REPUTATION.MAX,
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  experience: {
    type: Number,
    default: 0,
    min: 0,
  },
  inventory: {
    tools: [toolSchema],
    colors: [{
      colorId: String,
      quantity: {
        type: Number,
        default: 100,
      }
    }],
  },
  stats: {
    totalGraffitis: {
      type: Number,
      default: 0,
    },
    spotsOwned: {
      type: Number,
      default: 0,
    },
    timesArrested: {
      type: Number,
      default: 0,
    },
    successfulEscapes: {
      type: Number,
      default: 0,
    },
    totalPlayTime: {
      type: Number,
      default: 0, // in seconds
    },
  },
  jailStatus: {
    isInJail: {
      type: Boolean,
      default: false,
    },
    releaseTime: {
      type: Date,
    },
    reason: String,
  },
  arrestHistory: [arrestRecordSchema],
  crewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crew',
  },
  preferences: {
    defaultTool: {
      type: String,
      default: 'spray_can',
    },
    defaultColor: {
      type: String,
      default: 'black',
    },
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to check if player is in jail
playerSchema.methods.checkJailStatus = function() {
  if (this.jailStatus.isInJail && this.jailStatus.releaseTime) {
    if (new Date() >= this.jailStatus.releaseTime) {
      this.jailStatus.isInJail = false;
      this.jailStatus.releaseTime = null;
      this.jailStatus.reason = null;
      return false;
    }
    return true;
  }
  return false;
};

// Method to add money
playerSchema.methods.addMoney = function(amount) {
  this.money += amount;
  return this.money;
};

// Method to deduct money
playerSchema.methods.deductMoney = function(amount) {
  if (this.money < amount) {
    throw new Error('Insufficient funds');
  }
  this.money -= amount;
  return this.money;
};

// Method to add reputation
playerSchema.methods.addReputation = function(amount) {
  this.reputation = Math.min(
    this.reputation + amount,
    GAME_CONSTANTS.REPUTATION.MAX
  );
  return this.reputation;
};

// Method to deduct reputation
playerSchema.methods.deductReputation = function(amount) {
  this.reputation = Math.max(
    this.reputation - amount,
    GAME_CONSTANTS.REPUTATION.MIN
  );
  return this.reputation;
};

// Method to add tool to inventory
playerSchema.methods.addTool = function(toolId) {
  const tool = GAME_CONSTANTS.TOOLS[toolId.toUpperCase()];
  if (!tool) {
    throw new Error('Invalid tool');
  }

  this.inventory.tools.push({
    toolId: tool.id,
    durability: tool.durability,
    capacity: tool.capacity,
  });

  return this.inventory.tools[this.inventory.tools.length - 1];
};

// Method to get active tools (durability > 0)
playerSchema.methods.getActiveTools = function() {
  return this.inventory.tools.filter(tool => tool.durability > 0 && tool.capacity > 0);
};

// Calculate level from experience
playerSchema.methods.calculateLevel = function() {
  // Simple level formula: level = floor(sqrt(experience / 100)) + 1
  this.level = Math.floor(Math.sqrt(this.experience / 100)) + 1;
  return this.level;
};

// Update last active timestamp
playerSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

const Player = mongoose.model('Player', playerSchema);

export default Player;

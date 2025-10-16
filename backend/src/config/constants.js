// Game Constants
export const GAME_CONSTANTS = {
  STEALTH: {
    MAX: 100,
    DEFAULT_DRAIN_RATE: 5,
    LOOK_AROUND_RESTORE: 50,
    MAX_LOOK_AROUNDS: 3,
    LOOK_AROUND_COOLDOWN: 10000, // 10 seconds
  },

  POLICE: {
    QTE_TIME_LIMIT: 10000, // 10 seconds
    QTE_REQUIRED_TAPS: 8,
    MAX_OVERLOOKED_VEHICLES: 3,
    BASE_FINE: 100,
    ARREST_THRESHOLD: 3, // arrests in 24h
    ARREST_THRESHOLD_EXTENDED: 5, // arrests in 48h
  },

  JAIL: {
    BASE_TIME_HOURS: 72,
    EXTENDED_TIME_HOURS: 168, // 1 week
  },

  SPOT_TYPES: {
    WALL: { name: 'wall', riskFactor: 0.3, baseScore: 100 },
    ELECTRICAL_BOX: { name: 'electrical_box', riskFactor: 0.6, baseScore: 150 },
    BRIDGE: { name: 'bridge', riskFactor: 0.8, baseScore: 200 },
    TRAIN: { name: 'train', riskFactor: 0.9, baseScore: 300 },
    BILLBOARD: { name: 'billboard', riskFactor: 0.95, baseScore: 500 },
  },

  RISK_EVENTS: {
    PEDESTRIAN: { multiplier: 1.5, duration: 15000 },
    CAR_PASSING: { multiplier: 1.2, duration: 10000 },
    POLICE_PATROL: { multiplier: 2.0, duration: 20000 },
    GOOD_COVER: { multiplier: 0.7, duration: 30000 },
    NIGHT_FALL: { multiplier: 0.5, duration: 60000 },
  },

  TOOLS: {
    SPRAY_CAN: {
      id: 'spray_can',
      name: 'Spray Can',
      cost: 10,
      durability: 100,
      capacity: 100,
      consumptionRate: 1.0,
      stats: {
        coverageSpeed: 1.0,
        precision: 0.7,
        flowRate: 1.0,
        sprayWidth: 10,
      }
    },
    FAT_CAP: {
      id: 'fat_cap',
      name: 'Fat Cap',
      cost: 15,
      durability: 100,
      capacity: 100,
      consumptionRate: 1.5,
      stats: {
        coverageSpeed: 1.5,
        precision: 0.5,
        flowRate: 1.5,
        sprayWidth: 20,
      }
    },
    SKINNY_CAP: {
      id: 'skinny_cap',
      name: 'Skinny Cap',
      cost: 15,
      durability: 100,
      capacity: 100,
      consumptionRate: 0.7,
      stats: {
        coverageSpeed: 0.7,
        precision: 0.95,
        flowRate: 0.7,
        sprayWidth: 3,
      }
    },
    MARKER: {
      id: 'marker',
      name: 'Marker',
      cost: 5,
      durability: 100,
      capacity: 50,
      consumptionRate: 0.5,
      stats: {
        coverageSpeed: 0.5,
        precision: 0.9,
        flowRate: 0.8,
        sprayWidth: 5,
      }
    },
  },

  COLORS: [
    { id: 'black', name: 'Black', hex: '#000000', cost: 5 },
    { id: 'white', name: 'White', hex: '#FFFFFF', cost: 5 },
    { id: 'red', name: 'Red', hex: '#FF0000', cost: 8 },
    { id: 'blue', name: 'Blue', hex: '#0000FF', cost: 8 },
    { id: 'yellow', name: 'Yellow', hex: '#FFFF00', cost: 8 },
    { id: 'green', name: 'Green', hex: '#00FF00', cost: 8 },
    { id: 'orange', name: 'Orange', hex: '#FF6600', cost: 10 },
    { id: 'purple', name: 'Purple', hex: '#9900FF', cost: 10 },
    { id: 'pink', name: 'Pink', hex: '#FF69B4', cost: 10 },
    { id: 'chrome', name: 'Chrome', hex: '#C0C0C0', cost: 20 },
    { id: 'gold', name: 'Gold', hex: '#FFD700', cost: 25 },
  ],

  REPUTATION: {
    MIN: 0,
    MAX: 10000,
    ARREST_PENALTY: 50,
    ESCAPE_REWARD: 25,
    PIECE_BASE_REWARD: 100,
  },
};

// API Rate Limits
export const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  AUTH: {
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 minutes
  },
  PAINTING: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 save attempts per minute
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists',
    UNAUTHORIZED: 'Unauthorized access',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
  },
  PLAYER: {
    NOT_FOUND: 'Player not found',
    INSUFFICIENT_FUNDS: 'Insufficient funds',
    IN_JAIL: 'Player is currently in jail',
  },
  SPOT: {
    NOT_FOUND: 'Spot not found',
    ALREADY_OWNED: 'Spot is already owned by another crew',
    INVALID_LOCATION: 'Invalid location coordinates',
  },
  VALIDATION: {
    MISSING_FIELDS: 'Missing required fields',
    INVALID_FORMAT: 'Invalid data format',
  },
};

export default {
  GAME_CONSTANTS,
  RATE_LIMITS,
  ERROR_MESSAGES,
};

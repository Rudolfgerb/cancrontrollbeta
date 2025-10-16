/**
 * Security Middleware - Production-Grade Protection
 * Silicon Valley Standard Security Implementation
 */

import rateLimit from 'express-rate-limit';
import Joi from 'joi';

/**
 * Rate Limiter Configuration
 * Prevents brute force and DDoS attacks
 */
export const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
  };

  return rateLimit({ ...defaults, ...options });
};

/**
 * Specific rate limiters for different endpoints
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again in 15 minutes.',
  },
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

export const paintingLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 paintings per minute
  message: {
    success: false,
    error: 'Slow down! Too many painting requests.',
  },
});

/**
 * Input Validation Schemas
 * Prevents injection attacks and malformed data
 */
export const validationSchemas = {
  // User registration
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must only contain alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
      }),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character',
      }),
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Graffiti submission
  graffiti: Joi.object({
    spotId: Joi.string().required(),
    imageData: Joi.string().required(),
    quality: Joi.number().min(0).max(100).required(),
    timeSpent: Joi.number().min(0).max(3600000).required(), // Max 1 hour
    coverage: Joi.number().min(0).max(100).required(),
    stealthEvaded: Joi.boolean().default(false),
  }),

  // Spot creation
  spot: Joi.object({
    location: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
    }).required(),
    address: Joi.string().max(500).required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'extreme').required(),
    estimatedValue: Joi.number().min(0).max(10000).required(),
  }),

  // Player update
  playerUpdate: Joi.object({
    crewName: Joi.string().max(50).optional(),
    style: Joi.string().valid('wildstyle', 'bubble', 'throwie', 'tag', 'piece').optional(),
    bio: Joi.string().max(500).optional(),
  }),

  // Purchase
  purchase: Joi.object({
    itemType: Joi.string().valid('tool', 'color').required(),
    itemId: Joi.string().required(),
    quantity: Joi.number().min(1).max(100).default(1),
  }),

  // ID parameters
  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
    }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sort: Joi.string().valid('createdAt', 'quality', 'reputation', 'level').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

/**
 * Validation Middleware Factory
 * Creates middleware to validate request data against schema
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Sanitize Input Middleware
 * Additional layer to prevent XSS attacks
 */
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else {
        sanitized[key] = sanitize(value);
      }
    }
    return sanitized;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

/**
 * CORS Configuration for Production
 */
export const getCorsOptions = () => {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  };
};

/**
 * Helmet Security Headers Configuration
 */
export const getHelmetConfig = () => {
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://maps.googleapis.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: [
          "'self'",
          'https://maps.googleapis.com',
          'wss:',
          'ws:',
          process.env.CORS_ORIGIN || 'http://localhost:5173',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", 'https://www.google.com'],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  };
};

/**
 * Request Logger Middleware
 * Enhanced security logging
 */
export const securityLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    // Log suspicious activity
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429) {
      console.warn('⚠️  Security Alert:', logData);
    } else if (res.statusCode >= 500) {
      console.error('❌ Server Error:', logData);
    } else {
      console.log('✅ Request:', `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
};

/**
 * Environment Variable Validator
 */
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'GOOGLE_MAPS_API_KEY',
    'NODE_ENV',
  ];

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long for security');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
};

/**
 * Error Handler for Security Middleware
 */
export const securityErrorHandler = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.details,
    });
  }

  next(err);
};

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from '../config';

/**
 * Security headers middleware (Helmet)
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for some frameworks
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/**
 * CORS configuration
 * Allows multiple origins for development (frontend can run on different ports)
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) {
      return callback(null, true);
    }

    // Issue #9: Use ALLOWED_ORIGINS from config (supports multiple origins via env var)
    const allowedOrigins = config.allowedOrigins || [config.frontendUrl];
    
    // In development, also allow common localhost ports
    const devOrigins = config.nodeEnv === 'development' 
      ? [
          'http://localhost:3000',
          'http://localhost:8080', // Vite default port
          'http://127.0.0.1:3000',
          'http://127.0.0.1:8080',
        ]
      : [];

    const allAllowedOrigins = [...allowedOrigins, ...devOrigins].filter(Boolean);

    if (allAllowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow any localhost origin
      if (config.nodeEnv === 'development' && origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}. Allowed origins: ${allAllowedOrigins.join(', ')}`));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in test environment
  skip: () => config.nodeEnv === 'test',
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMaxRequests,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  skip: () => config.nodeEnv === 'test',
});

/**
 * Request size limiter
 * Prevent large payloads
 */
export const requestSizeLimit = '10mb';


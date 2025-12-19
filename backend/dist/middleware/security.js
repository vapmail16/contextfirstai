"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestSizeLimit = exports.authLimiter = exports.apiLimiter = exports.corsConfig = exports.securityHeaders = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = __importDefault(require("../config"));
/**
 * Security headers middleware (Helmet)
 */
exports.securityHeaders = (0, helmet_1.default)({
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
exports.corsConfig = (0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or curl)
        if (!origin) {
            return callback(null, true);
        }
        // Issue #9: Use ALLOWED_ORIGINS from config (supports multiple origins via env var)
        const allowedOrigins = config_1.default.allowedOrigins || [config_1.default.frontendUrl];
        // In development, also allow common localhost ports
        const devOrigins = config_1.default.nodeEnv === 'development'
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
        }
        else {
            // In development, allow any localhost origin
            if (config_1.default.nodeEnv === 'development' && origin.includes('localhost')) {
                callback(null, true);
            }
            else {
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
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.default.rateLimit.windowMs,
    max: config_1.default.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in test environment
    skip: () => config_1.default.nodeEnv === 'test',
});
/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.default.rateLimit.windowMs,
    max: config_1.default.rateLimit.authMaxRequests,
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    skip: () => config_1.default.nodeEnv === 'test',
});
/**
 * Request size limiter
 * Prevent large payloads
 */
exports.requestSizeLimit = '10mb';
//# sourceMappingURL=security.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const config_1 = __importDefault(require("../config"));
const errors_1 = require("../utils/errors");
/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, _res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Verify token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errors_1.UnauthorizedError('Token expired');
            }
            throw new errors_1.UnauthorizedError('Invalid token');
        }
        // Get user from database
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        if (!user.isActive) {
            throw new errors_1.UnauthorizedError('Account is disabled');
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errors_1.ForbiddenError('Insufficient permissions'));
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Optional authentication middleware
 * Attaches user to request if token is present, but doesn't fail if absent
 */
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token, continue without user
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                },
            });
            if (user && user.isActive) {
                req.user = user;
            }
        }
        catch (error) {
            // Invalid token, but we don't fail - just continue without user
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
exports.default = { authenticate: exports.authenticate, requireRole: exports.requireRole, optionalAuth: exports.optionalAuth };
//# sourceMappingURL=auth.js.map
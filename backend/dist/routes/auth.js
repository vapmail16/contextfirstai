"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authService = __importStar(require("../services/authService"));
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const security_1 = require("../middleware/security");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const config_1 = __importDefault(require("../config"));
const router = (0, express_1.Router)();
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', security_1.authLimiter, (0, validation_1.validate)([
    validation_1.validators.email,
    validation_1.validators.password,
    validation_1.validators.name,
]), (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password, name } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const user = await authService.register(email, password, name, ipAddress, userAgent);
    res.status(201).json({
        success: true,
        data: user,
    });
}));
/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', security_1.authLimiter, (0, validation_1.validate)([
    validation_1.validators.email,
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
]), (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const { user, accessToken, refreshToken } = await authService.login(email, password, ipAddress, userAgent);
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: config_1.default.cookie.httpOnly,
        secure: config_1.default.cookie.secure,
        sameSite: config_1.default.cookie.sameSite,
        maxAge: config_1.default.cookie.maxAge,
        domain: config_1.default.cookie.domain,
    });
    res.json({
        success: true,
        data: {
            user,
            accessToken,
        },
    });
}));
/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', (0, asyncHandler_1.default)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({
            success: false,
            error: 'No refresh token provided',
        });
        return;
    }
    const { accessToken } = await authService.refreshAccessToken(refreshToken);
    res.json({
        success: true,
        data: { accessToken },
    });
}));
/**
 * POST /api/auth/logout
 * Logout user (delete session)
 */
router.post('/logout', auth_1.authenticate, (0, asyncHandler_1.default)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await authService.logout(refreshToken);
    }
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
        httpOnly: config_1.default.cookie.httpOnly,
        secure: config_1.default.cookie.secure,
        sameSite: config_1.default.cookie.sameSite,
        domain: config_1.default.cookie.domain,
    });
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
}));
/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', auth_1.authenticate, (0, asyncHandler_1.default)(async (req, res) => {
    const user = await authService.getUserById(req.user.id);
    res.json({
        success: true,
        data: user,
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map
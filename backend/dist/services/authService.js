"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.logout = exports.refreshAccessToken = exports.login = exports.register = exports.generateTokens = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const config_1 = __importDefault(require("../config"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Hash password
 */
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, 12);
};
exports.hashPassword = hashPassword;
/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
/**
 * Generate access and refresh tokens
 */
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, config_1.default.jwt.secret, { expiresIn: config_1.default.jwt.expiresIn });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, config_1.default.jwt.refreshSecret, { expiresIn: config_1.default.jwt.refreshExpiresIn });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
/**
 * Register a new user
 */
const register = async (email, password, name, ipAddress, userAgent) => {
    // Check if registration is enabled
    if (!config_1.default.features.registration) {
        throw new errors_2.ForbiddenError('Registration is currently disabled');
    }
    // Check if user already exists
    const existingUser = await database_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new errors_1.ConflictError('Email already registered');
    }
    // Hash password
    const hashedPassword = await (0, exports.hashPassword)(password);
    // Create user
    const user = await database_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });
    // Log audit trail
    await database_1.prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'USER_REGISTERED',
            resource: 'users',
            resourceId: user.id,
            ipAddress,
            userAgent,
        },
    });
    logger_1.default.info('User registered', { userId: user.id, email: user.email });
    return user;
};
exports.register = register;
/**
 * Login user
 */
const login = async (email, password, ipAddress, userAgent) => {
    // Find user
    const user = await database_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new errors_1.UnauthorizedError('Invalid credentials');
    }
    // Check if user is active
    if (!user.isActive) {
        throw new errors_1.UnauthorizedError('Account is disabled');
    }
    // Verify password
    const isValidPassword = await (0, exports.comparePassword)(password, user.password);
    if (!isValidPassword) {
        // Log failed login attempt
        await database_1.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN_FAILED',
                resource: 'users',
                resourceId: user.id,
                ipAddress,
                userAgent,
            },
        });
        throw new errors_1.UnauthorizedError('Invalid credentials');
    }
    // Generate tokens
    const { accessToken, refreshToken } = (0, exports.generateTokens)(user.id);
    // Save refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    await database_1.prisma.session.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt,
            ipAddress,
            userAgent,
        },
    });
    // Log successful login
    await database_1.prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'USER_LOGIN',
            resource: 'users',
            resourceId: user.id,
            ipAddress,
            userAgent,
        },
    });
    logger_1.default.info('User logged in', { userId: user.id, email: user.email });
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        accessToken,
        refreshToken,
    };
};
exports.login = login;
/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
    // Verify refresh token
    try {
        jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwt.refreshSecret);
    }
    catch (error) {
        throw new errors_1.UnauthorizedError('Invalid refresh token');
    }
    // Check if session exists and is valid
    const session = await database_1.prisma.session.findUnique({
        where: { token: refreshToken },
        include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
        throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
    }
    if (!session.user.isActive) {
        throw new errors_1.UnauthorizedError('Account is disabled');
    }
    // Generate new access token
    const accessToken = jsonwebtoken_1.default.sign({ userId: session.userId }, config_1.default.jwt.secret, { expiresIn: config_1.default.jwt.expiresIn });
    return { accessToken };
};
exports.refreshAccessToken = refreshAccessToken;
/**
 * Logout user (delete session)
 */
const logout = async (refreshToken) => {
    // Delete session
    await database_1.prisma.session.delete({
        where: { token: refreshToken },
    });
    logger_1.default.info('User logged out');
};
exports.logout = logout;
/**
 * Get user by ID
 */
const getUserById = async (userId) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new errors_1.NotFoundError('User not found');
    }
    return user;
};
exports.getUserById = getUserById;
// Import ForbiddenError for registration check
const errors_2 = require("../utils/errors");
//# sourceMappingURL=authService.js.map
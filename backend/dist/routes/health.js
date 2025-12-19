"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', (0, asyncHandler_1.default)(async (_req, res) => {
    // Check database connection
    let dbStatus = 'healthy';
    try {
        await database_1.prisma.$queryRaw `SELECT 1`;
    }
    catch (error) {
        dbStatus = 'unhealthy';
    }
    const health = {
        status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        memory: {
            used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
            total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        },
    };
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
}));
/**
 * GET /api/health/ready
 * Readiness probe for Kubernetes/Docker
 */
router.get('/ready', (0, asyncHandler_1.default)(async (_req, res) => {
    try {
        // Check if database is accessible
        await database_1.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            ready: true,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(503).json({
            ready: false,
            error: 'Database not accessible',
            timestamp: new Date().toISOString(),
        });
    }
}));
exports.default = router;
//# sourceMappingURL=health.js.map
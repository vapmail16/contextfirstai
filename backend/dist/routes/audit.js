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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditService = __importStar(require("../services/auditService"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * GET /api/audit
 * Get audit logs with optional filters (admin only in production)
 */
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, action, resource, resourceId, startDate, endDate, limit, offset, } = req.query;
    const logs = await auditService.getAuditLogs({
        userId: userId,
        action: action,
        resource: resource,
        resourceId: resourceId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
    });
    return res.json({
        success: true,
        data: logs,
    });
}));
/**
 * GET /api/audit/stats
 * Get audit log statistics (admin only in production)
 */
router.get('/stats', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const stats = await auditService.getAuditStats({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
    });
    return res.json({
        success: true,
        data: stats,
    });
}));
/**
 * GET /api/audit/user/:userId
 * Get audit logs for a specific user
 */
router.get('/user/:userId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const { limit, offset } = req.query;
    const logs = await auditService.getUserAuditLogs(userId, {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
    });
    return res.json({
        success: true,
        data: logs,
    });
}));
/**
 * GET /api/audit/resource/:resource
 * Get audit logs for a specific resource type
 */
router.get('/resource/:resource', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { resource } = req.params;
    const { resourceId, limit, offset } = req.query;
    const logs = await auditService.getResourceAuditLogs(resource, resourceId, {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
    });
    return res.json({
        success: true,
        data: logs,
    });
}));
/**
 * GET /api/audit/:id
 * Get a specific audit log by ID
 */
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const log = await auditService.getAuditLogById(req.params.id);
    if (!log) {
        return res.status(404).json({
            success: false,
            error: 'Audit log not found',
        });
    }
    return res.json({
        success: true,
        data: log,
    });
}));
/**
 * POST /api/audit
 * Create an audit log entry (typically called by middleware, not directly)
 */
router.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { action, resource, resourceId, details, ipAddress, userAgent } = req.body;
    const log = await auditService.createAuditLog({
        userId: req.user.id,
        action,
        resource,
        resourceId,
        details,
        ipAddress: ipAddress || req.ip,
        userAgent: userAgent || req.get('user-agent'),
    });
    return res.status(201).json({
        success: true,
        data: log,
    });
}));
/**
 * DELETE /api/audit/old/:days
 * Delete audit logs older than specified days (admin only in production)
 */
router.delete('/old/:days', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const days = parseInt(req.params.days);
    if (isNaN(days) || days < 1) {
        return res.status(400).json({
            success: false,
            error: 'Invalid days parameter',
        });
    }
    const deletedCount = await auditService.deleteOldAuditLogs(days);
    return res.json({
        success: true,
        data: { deletedCount },
        message: `Deleted ${deletedCount} audit logs older than ${days} days`,
    });
}));
exports.default = router;
//# sourceMappingURL=audit.js.map
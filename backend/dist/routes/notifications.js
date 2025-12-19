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
const notificationService = __importStar(require("../services/notificationService"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { unreadOnly, limit, offset } = req.query;
    const notifications = await notificationService.getUserNotifications(req.user.id, {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
    });
    return res.json({
        success: true,
        data: notifications,
    });
}));
/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.id);
    return res.json({
        success: true,
        data: { count },
    });
}));
/**
 * POST /api/notifications
 * Create a notification (admin/system use)
 */
router.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { type, channel, title, message, data } = req.body;
    const notification = await notificationService.createNotification({
        userId: req.user.id,
        type,
        channel,
        title,
        message,
        data,
    });
    return res.status(201).json({
        success: true,
        data: notification,
    });
}));
/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    return res.json({
        success: true,
        data: notification,
    });
}));
/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const count = await notificationService.markAllAsRead(req.user.id);
    return res.json({
        success: true,
        data: { count },
    });
}));
/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await notificationService.deleteNotification(req.params.id, req.user.id);
    return res.json({
        success: true,
        message: 'Notification deleted',
    });
}));
/**
 * GET /api/notifications/preferences
 * Get user notification preferences
 */
router.get('/preferences', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const preferences = await notificationService.getUserPreferences(req.user.id);
    return res.json({
        success: true,
        data: preferences,
    });
}));
/**
 * PUT /api/notifications/preferences
 * Update user notification preferences
 */
router.put('/preferences', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const preferences = await notificationService.updateUserPreferences(req.user.id, req.body);
    return res.json({
        success: true,
        data: preferences,
    });
}));
exports.default = router;
//# sourceMappingURL=notifications.js.map
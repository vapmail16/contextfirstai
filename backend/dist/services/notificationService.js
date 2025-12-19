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
exports.updateUserPreferences = exports.getUserPreferences = exports.deleteNotification = exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const emailService = __importStar(require("./emailService"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
/**
 * Create a notification
 */
const createNotification = async (params) => {
    // Get user preferences
    const preferences = await (0, exports.getUserPreferences)(params.userId);
    // Check if channel is enabled
    const isChannelEnabled = (params.channel === 'EMAIL' && preferences.emailEnabled) ||
        (params.channel === 'IN_APP' && preferences.inAppEnabled) ||
        (params.channel === 'SMS' && preferences.smsEnabled);
    // Create notification
    const notification = await database_1.prisma.notification.create({
        data: {
            userId: params.userId,
            type: params.type,
            channel: params.channel,
            title: params.title,
            message: params.message,
            data: params.data || client_1.Prisma.JsonNull,
            status: 'PENDING',
        },
    });
    // Send notification if channel is enabled
    if (isChannelEnabled) {
        try {
            if (params.channel === 'EMAIL') {
                const user = await database_1.prisma.user.findUnique({
                    where: { id: params.userId },
                });
                if (user) {
                    await emailService.sendNotificationEmail({
                        to: user.email,
                        name: user.name || undefined,
                        subject: params.title,
                        title: params.title,
                        message: params.message,
                    });
                    // Update status to SENT
                    await database_1.prisma.notification.update({
                        where: { id: notification.id },
                        data: {
                            status: 'SENT',
                            sentAt: new Date(),
                        },
                    });
                    logger_1.default.info('Email notification sent', {
                        notificationId: notification.id,
                        userId: params.userId,
                    });
                }
            }
            else if (params.channel === 'IN_APP') {
                // In-app notifications are immediately "sent" (visible)
                await database_1.prisma.notification.update({
                    where: { id: notification.id },
                    data: {
                        status: 'SENT',
                        sentAt: new Date(),
                    },
                });
            }
            // SMS would be implemented here
        }
        catch (error) {
            logger_1.default.error('Failed to send notification', {
                notificationId: notification.id,
                error: error.message,
            });
            // Update status to FAILED
            await database_1.prisma.notification.update({
                where: { id: notification.id },
                data: { status: 'FAILED' },
            });
        }
    }
    else {
        logger_1.default.info('Notification not sent - channel disabled', {
            notificationId: notification.id,
            channel: params.channel,
        });
    }
    return database_1.prisma.notification.findUniqueOrThrow({
        where: { id: notification.id },
    });
};
exports.createNotification = createNotification;
/**
 * Get user notifications
 */
const getUserNotifications = async (userId, options) => {
    const where = { userId };
    if (options?.unreadOnly) {
        where.status = { not: 'READ' };
    }
    return database_1.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit,
        skip: options?.offset,
    });
};
exports.getUserNotifications = getUserNotifications;
/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
    // Verify ownership
    const notification = await database_1.prisma.notification.findUnique({
        where: { id: notificationId },
    });
    if (!notification) {
        throw new errors_1.NotFoundError('Notification not found');
    }
    if (notification.userId !== userId) {
        throw new errors_1.ForbiddenError('Cannot mark another user\'s notification');
    }
    return database_1.prisma.notification.update({
        where: { id: notificationId },
        data: {
            status: 'READ',
            readAt: new Date(),
        },
    });
};
exports.markAsRead = markAsRead;
/**
 * Mark all user notifications as read
 */
const markAllAsRead = async (userId) => {
    const result = await database_1.prisma.notification.updateMany({
        where: {
            userId,
            status: { not: 'READ' },
        },
        data: {
            status: 'READ',
            readAt: new Date(),
        },
    });
    return result.count;
};
exports.markAllAsRead = markAllAsRead;
/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
    return database_1.prisma.notification.count({
        where: {
            userId,
            status: { not: 'READ' },
        },
    });
};
exports.getUnreadCount = getUnreadCount;
/**
 * Delete notification
 */
const deleteNotification = async (notificationId, userId) => {
    // Verify ownership
    const notification = await database_1.prisma.notification.findUnique({
        where: { id: notificationId },
    });
    if (!notification) {
        throw new errors_1.NotFoundError('Notification not found');
    }
    if (notification.userId !== userId) {
        throw new errors_1.ForbiddenError('Cannot delete another user\'s notification');
    }
    await database_1.prisma.notification.delete({
        where: { id: notificationId },
    });
};
exports.deleteNotification = deleteNotification;
/**
 * Get user notification preferences
 */
const getUserPreferences = async (userId) => {
    let preferences = await database_1.prisma.notificationPreference.findUnique({
        where: { userId },
    });
    // Create default preferences if not exist
    if (!preferences) {
        preferences = await database_1.prisma.notificationPreference.create({
            data: {
                userId,
                emailEnabled: true,
                inAppEnabled: true,
                smsEnabled: false,
            },
        });
    }
    return preferences;
};
exports.getUserPreferences = getUserPreferences;
/**
 * Update user notification preferences
 */
const updateUserPreferences = async (userId, updates) => {
    // Ensure preferences exist
    await (0, exports.getUserPreferences)(userId);
    return database_1.prisma.notificationPreference.update({
        where: { userId },
        data: updates,
    });
};
exports.updateUserPreferences = updateUserPreferences;
//# sourceMappingURL=notificationService.js.map
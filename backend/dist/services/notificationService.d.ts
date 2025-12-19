import { NotificationType, NotificationChannel, Notification, NotificationPreference } from '@prisma/client';
/**
 * Create a notification
 */
export declare const createNotification: (params: {
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    message: string;
    data?: Record<string, any>;
}) => Promise<Notification>;
/**
 * Get user notifications
 */
export declare const getUserNotifications: (userId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
}) => Promise<Notification[]>;
/**
 * Mark notification as read
 */
export declare const markAsRead: (notificationId: string, userId: string) => Promise<Notification>;
/**
 * Mark all user notifications as read
 */
export declare const markAllAsRead: (userId: string) => Promise<number>;
/**
 * Get unread notification count
 */
export declare const getUnreadCount: (userId: string) => Promise<number>;
/**
 * Delete notification
 */
export declare const deleteNotification: (notificationId: string, userId: string) => Promise<void>;
/**
 * Get user notification preferences
 */
export declare const getUserPreferences: (userId: string) => Promise<NotificationPreference>;
/**
 * Update user notification preferences
 */
export declare const updateUserPreferences: (userId: string, updates: {
    emailEnabled?: boolean;
    inAppEnabled?: boolean;
    smsEnabled?: boolean;
}) => Promise<NotificationPreference>;
//# sourceMappingURL=notificationService.d.ts.map
import { AuditLog } from '@prisma/client';
/**
 * Create an audit log entry
 */
export declare const createAuditLog: (params: {
    userId?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}) => Promise<AuditLog>;
/**
 * Get audit logs with optional filters
 */
export declare const getAuditLogs: (filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}) => Promise<AuditLog[]>;
/**
 * Get audit log by ID
 */
export declare const getAuditLogById: (id: string) => Promise<AuditLog | null>;
/**
 * Get all audit logs for a specific user
 */
export declare const getUserAuditLogs: (userId: string, options?: {
    limit?: number;
    offset?: number;
}) => Promise<AuditLog[]>;
/**
 * Get all audit logs for a specific resource
 */
export declare const getResourceAuditLogs: (resource: string, resourceId?: string, options?: {
    limit?: number;
    offset?: number;
}) => Promise<AuditLog[]>;
/**
 * Delete audit logs older than specified days
 */
export declare const deleteOldAuditLogs: (daysToKeep: number) => Promise<number>;
/**
 * Get audit log statistics
 */
export declare const getAuditStats: (filters?: {
    startDate?: Date;
    endDate?: Date;
}) => Promise<{
    totalLogs: number;
    uniqueUsers: number;
    actionCounts: Record<string, number>;
    resourceCounts: Record<string, number>;
}>;
//# sourceMappingURL=auditService.d.ts.map
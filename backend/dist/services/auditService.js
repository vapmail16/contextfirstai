"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditStats = exports.deleteOldAuditLogs = exports.getResourceAuditLogs = exports.getUserAuditLogs = exports.getAuditLogById = exports.getAuditLogs = exports.createAuditLog = void 0;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Create an audit log entry
 */
const createAuditLog = async (params) => {
    try {
        const log = await database_1.prisma.auditLog.create({
            data: {
                userId: params.userId || null,
                action: params.action,
                resource: params.resource || null,
                resourceId: params.resourceId || null,
                details: params.details || client_1.Prisma.JsonNull,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
            },
        });
        logger_1.default.info('Audit log created', {
            logId: log.id,
            action: log.action,
            userId: log.userId,
            resource: log.resource,
        });
        return log;
    }
    catch (error) {
        logger_1.default.error('Failed to create audit log', {
            error: error.message,
            action: params.action,
        });
        throw error;
    }
};
exports.createAuditLog = createAuditLog;
/**
 * Get audit logs with optional filters
 */
const getAuditLogs = async (filters) => {
    const where = {};
    if (filters?.userId) {
        where.userId = filters.userId;
    }
    if (filters?.action) {
        where.action = filters.action;
    }
    if (filters?.resource) {
        where.resource = filters.resource;
    }
    if (filters?.resourceId) {
        where.resourceId = filters.resourceId;
    }
    if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
            where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
            where.createdAt.lte = filters.endDate;
        }
    }
    return database_1.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit,
        skip: filters?.offset,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });
};
exports.getAuditLogs = getAuditLogs;
/**
 * Get audit log by ID
 */
const getAuditLogById = async (id) => {
    return database_1.prisma.auditLog.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });
};
exports.getAuditLogById = getAuditLogById;
/**
 * Get all audit logs for a specific user
 */
const getUserAuditLogs = async (userId, options) => {
    return database_1.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: options?.limit,
        skip: options?.offset,
    });
};
exports.getUserAuditLogs = getUserAuditLogs;
/**
 * Get all audit logs for a specific resource
 */
const getResourceAuditLogs = async (resource, resourceId, options) => {
    const where = { resource };
    if (resourceId) {
        where.resourceId = resourceId;
    }
    return database_1.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit,
        skip: options?.offset,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });
};
exports.getResourceAuditLogs = getResourceAuditLogs;
/**
 * Delete audit logs older than specified days
 */
const deleteOldAuditLogs = async (daysToKeep) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const result = await database_1.prisma.auditLog.deleteMany({
        where: {
            createdAt: {
                lt: cutoffDate,
            },
        },
    });
    logger_1.default.info('Old audit logs deleted', {
        daysToKeep,
        deletedCount: result.count,
    });
    return result.count;
};
exports.deleteOldAuditLogs = deleteOldAuditLogs;
/**
 * Get audit log statistics
 */
const getAuditStats = async (filters) => {
    const where = {};
    if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
            where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
            where.createdAt.lte = filters.endDate;
        }
    }
    // Get total logs
    const totalLogs = await database_1.prisma.auditLog.count({ where });
    // Get unique users
    const uniqueUsers = await database_1.prisma.auditLog.findMany({
        where: {
            ...where,
            userId: { not: null },
        },
        select: { userId: true },
        distinct: ['userId'],
    });
    // Get action counts
    const actionGroups = await database_1.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
    });
    const actionCounts = {};
    actionGroups.forEach((group) => {
        actionCounts[group.action] = group._count.action;
    });
    // Get resource counts
    const resourceGroups = await database_1.prisma.auditLog.groupBy({
        by: ['resource'],
        where: {
            ...where,
            resource: { not: null },
        },
        _count: { resource: true },
    });
    const resourceCounts = {};
    resourceGroups.forEach((group) => {
        if (group.resource) {
            resourceCounts[group.resource] = group._count.resource;
        }
    });
    return {
        totalLogs,
        uniqueUsers: uniqueUsers.length,
        actionCounts,
        resourceCounts,
    };
};
exports.getAuditStats = getAuditStats;
//# sourceMappingURL=auditService.js.map
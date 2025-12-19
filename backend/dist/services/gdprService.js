"use strict";
/**
 * GDPR Compliance Service
 *
 * Handles data export, deletion, and consent management
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDeletionRequests = exports.getUserExportRequests = exports.hasConsent = exports.getUserConsents = exports.revokeConsent = exports.grantConsent = exports.executeDataDeletion = exports.confirmDataDeletion = exports.requestDataDeletion = exports.generateDataExport = exports.requestDataExport = void 0;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const auditService_1 = require("./auditService");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Request data export
 */
const requestDataExport = async (userId) => {
    try {
        // Create export request
        const exportRequest = await database_1.prisma.dataExportRequest.create({
            data: {
                userId,
                status: client_1.DataExportStatus.PENDING,
            },
        });
        // Create audit log
        await (0, auditService_1.createAuditLog)({
            userId,
            action: 'DATA_EXPORT_REQUESTED',
            resource: 'data_export_requests',
            resourceId: exportRequest.id,
        });
        logger_1.default.info('Data export requested', { userId, requestId: exportRequest.id });
        // In a real system, this would trigger a background job to generate the export
        // For now, we'll mark it as processing
        return exportRequest;
    }
    catch (error) {
        logger_1.default.error('Data export request failed', { userId, error: error.message });
        throw new errors_1.AppError('Failed to request data export', 500);
    }
};
exports.requestDataExport = requestDataExport;
/**
 * Generate data export (collects all user data)
 */
const generateDataExport = async (requestId) => {
    try {
        const request = await database_1.prisma.dataExportRequest.findUnique({
            where: { id: requestId },
            include: { user: true },
        });
        if (!request) {
            throw new errors_1.NotFoundError('Export request not found');
        }
        // Update status to processing
        await database_1.prisma.dataExportRequest.update({
            where: { id: requestId },
            data: { status: client_1.DataExportStatus.PROCESSING },
        });
        // Collect all user data
        const userId = request.userId;
        const [user, sessions, auditLogs, notifications, payments, subscriptions, consentRecords,] = await Promise.all([
            database_1.prisma.user.findUnique({ where: { id: userId } }),
            database_1.prisma.session.findMany({ where: { userId } }),
            database_1.prisma.auditLog.findMany({ where: { userId } }),
            database_1.prisma.notification.findMany({ where: { userId } }),
            database_1.prisma.payment.findMany({ where: { userId }, include: { refunds: true } }),
            database_1.prisma.subscription.findMany({ where: { userId } }),
            database_1.prisma.consentRecord.findMany({ where: { userId } }),
        ]);
        // Compile data export
        const exportData = {
            user: {
                id: user?.id,
                email: user?.email,
                name: user?.name,
                role: user?.role,
                createdAt: user?.createdAt,
                updatedAt: user?.updatedAt,
            },
            sessions: sessions.map(s => ({
                id: s.id,
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
                userAgent: s.userAgent,
                ipAddress: s.ipAddress,
            })),
            auditLogs: auditLogs.map(a => ({
                action: a.action,
                resource: a.resource,
                createdAt: a.createdAt,
                ipAddress: a.ipAddress,
            })),
            notifications: notifications.map(n => ({
                title: n.title,
                message: n.message,
                createdAt: n.createdAt,
                status: n.status,
            })),
            payments: payments.map(p => ({
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                createdAt: p.createdAt,
                refunds: p.refunds,
            })),
            subscriptions,
            consents: consentRecords,
            exportMetadata: {
                requestId,
                generatedAt: new Date().toISOString(),
                format: 'JSON',
            },
        };
        const exportJson = JSON.stringify(exportData, null, 2);
        const fileSize = Buffer.byteLength(exportJson, 'utf8');
        // In a real system, upload to S3 and get downloadUrl
        // For now, we'll simulate this
        const downloadUrl = `/api/gdpr/exports/${requestId}/download`;
        // Update request with completion
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to download
        await database_1.prisma.dataExportRequest.update({
            where: { id: requestId },
            data: {
                status: client_1.DataExportStatus.COMPLETED,
                completedAt: new Date(),
                downloadUrl,
                fileSize,
                expiresAt,
            },
        });
        logger_1.default.info('Data export generated', {
            userId,
            requestId,
            fileSize,
        });
        return {
            requestId,
            downloadUrl,
            fileSize,
            expiresAt,
            data: exportData, // Return data directly for now
        };
    }
    catch (error) {
        // Mark as failed (only if request exists)
        try {
            await database_1.prisma.dataExportRequest.update({
                where: { id: requestId },
                data: {
                    status: client_1.DataExportStatus.FAILED,
                    errorMessage: error.message,
                },
            });
        }
        catch (updateError) {
            // Request might not exist, that's okay
        }
        logger_1.default.error('Data export generation failed', {
            requestId,
            error: error.message,
        });
        throw error;
    }
};
exports.generateDataExport = generateDataExport;
/**
 * Request data deletion
 */
const requestDataDeletion = async (userId, deletionType = client_1.DeletionType.SOFT, reason) => {
    try {
        // Generate confirmation token
        const confirmationToken = crypto_1.default.randomBytes(32).toString('hex');
        // Create deletion request
        const deletionRequest = await database_1.prisma.dataDeletionRequest.create({
            data: {
                userId,
                deletionType,
                reason,
                confirmationToken,
                status: client_1.DataDeletionStatus.PENDING,
            },
        });
        // Create audit log
        await (0, auditService_1.createAuditLog)({
            userId,
            action: 'DATA_DELETION_REQUESTED',
            resource: 'data_deletion_requests',
            resourceId: deletionRequest.id,
            details: { deletionType, reason },
        });
        logger_1.default.info('Data deletion requested', {
            userId,
            requestId: deletionRequest.id,
            deletionType,
        });
        return {
            ...deletionRequest,
            confirmationUrl: `/api/gdpr/deletion/confirm/${confirmationToken}`,
        };
    }
    catch (error) {
        logger_1.default.error('Data deletion request failed', { userId, error: error.message });
        throw new errors_1.AppError('Failed to request data deletion', 500);
    }
};
exports.requestDataDeletion = requestDataDeletion;
/**
 * Confirm data deletion
 */
const confirmDataDeletion = async (confirmationToken) => {
    try {
        const request = await database_1.prisma.dataDeletionRequest.findUnique({
            where: { confirmationToken },
        });
        if (!request) {
            throw new errors_1.NotFoundError('Deletion request not found');
        }
        if (request.status !== client_1.DataDeletionStatus.PENDING) {
            throw new errors_1.AppError('Deletion request already processed', 400);
        }
        // Update status to confirmed
        await database_1.prisma.dataDeletionRequest.update({
            where: { id: request.id },
            data: {
                status: client_1.DataDeletionStatus.CONFIRMED,
                confirmedAt: new Date(),
                scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            },
        });
        logger_1.default.info('Data deletion confirmed', {
            userId: request.userId,
            requestId: request.id,
        });
        return request;
    }
    catch (error) {
        logger_1.default.error('Data deletion confirmation failed', { error: error.message });
        throw error;
    }
};
exports.confirmDataDeletion = confirmDataDeletion;
/**
 * Execute data deletion
 */
const executeDataDeletion = async (requestId) => {
    try {
        const request = await database_1.prisma.dataDeletionRequest.findUnique({
            where: { id: requestId },
        });
        if (!request) {
            throw new errors_1.NotFoundError('Deletion request not found');
        }
        if (request.status !== client_1.DataDeletionStatus.CONFIRMED) {
            throw new errors_1.AppError('Deletion request not confirmed', 400);
        }
        // Update status to processing
        await database_1.prisma.dataDeletionRequest.update({
            where: { id: requestId },
            data: { status: client_1.DataDeletionStatus.PROCESSING },
        });
        const userId = request.userId;
        // Mark deletion as completed BEFORE deleting user (to avoid cascade issues)
        await database_1.prisma.dataDeletionRequest.update({
            where: { id: requestId },
            data: {
                status: client_1.DataDeletionStatus.COMPLETED,
                completedAt: new Date(),
            },
        });
        if (request.deletionType === client_1.DeletionType.SOFT) {
            // Soft delete - mark user as inactive and anonymize
            await database_1.prisma.user.update({
                where: { id: userId },
                data: {
                    isActive: false,
                    email: `deleted_${userId}@deleted.local`,
                    name: '[Deleted User]',
                },
            });
        }
        else {
            // Hard delete - permanently delete user and all related data
            // Note: deletion_requests have CASCADE, so they'll be deleted too
            await database_1.prisma.user.delete({
                where: { id: userId },
            });
        }
        logger_1.default.info('Data deletion executed', {
            userId,
            requestId,
            deletionType: request.deletionType,
        });
        return request;
    }
    catch (error) {
        // Mark as failed (only if request still exists)
        try {
            await database_1.prisma.dataDeletionRequest.update({
                where: { id: requestId },
                data: {
                    status: client_1.DataDeletionStatus.FAILED,
                    errorMessage: error.message,
                },
            });
        }
        catch (updateError) {
            // Request might have been deleted, that's okay
        }
        logger_1.default.error('Data deletion execution failed', {
            requestId,
            error: error.message,
        });
        throw error;
    }
};
exports.executeDataDeletion = executeDataDeletion;
/**
 * Grant consent
 */
const grantConsent = async (userId, consentType, ipAddress, userAgent, version) => {
    try {
        const consent = await database_1.prisma.consentRecord.upsert({
            where: {
                userId_consentType: {
                    userId,
                    consentType,
                },
            },
            update: {
                granted: true,
                grantedAt: new Date(),
                revokedAt: null,
                ipAddress,
                userAgent,
                version,
            },
            create: {
                userId,
                consentType,
                granted: true,
                grantedAt: new Date(),
                ipAddress,
                userAgent,
                version,
            },
        });
        // Create audit log
        await (0, auditService_1.createAuditLog)({
            userId,
            action: 'CONSENT_GRANTED',
            resource: 'consent_records',
            resourceId: consent.id,
            details: { consentType },
            ipAddress,
            userAgent,
        });
        logger_1.default.info('Consent granted', { userId, consentType });
        return consent;
    }
    catch (error) {
        logger_1.default.error('Grant consent failed', { userId, consentType, error: error.message });
        throw new errors_1.AppError('Failed to grant consent', 500);
    }
};
exports.grantConsent = grantConsent;
/**
 * Revoke consent
 */
const revokeConsent = async (userId, consentType, ipAddress, userAgent) => {
    try {
        const consent = await database_1.prisma.consentRecord.update({
            where: {
                userId_consentType: {
                    userId,
                    consentType,
                },
            },
            data: {
                granted: false,
                revokedAt: new Date(),
                ipAddress,
                userAgent,
            },
        });
        // Create audit log
        await (0, auditService_1.createAuditLog)({
            userId,
            action: 'CONSENT_REVOKED',
            resource: 'consent_records',
            resourceId: consent.id,
            details: { consentType },
            ipAddress,
            userAgent,
        });
        logger_1.default.info('Consent revoked', { userId, consentType });
        return consent;
    }
    catch (error) {
        logger_1.default.error('Revoke consent failed', { userId, consentType, error: error.message });
        throw error;
    }
};
exports.revokeConsent = revokeConsent;
/**
 * Get user consents
 */
const getUserConsents = async (userId) => {
    return database_1.prisma.consentRecord.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
    });
};
exports.getUserConsents = getUserConsents;
/**
 * Check if user has granted specific consent
 */
const hasConsent = async (userId, consentType) => {
    const consent = await database_1.prisma.consentRecord.findUnique({
        where: {
            userId_consentType: {
                userId,
                consentType,
            },
        },
    });
    return consent?.granted || false;
};
exports.hasConsent = hasConsent;
/**
 * Get user's data export requests
 */
const getUserExportRequests = async (userId) => {
    return database_1.prisma.dataExportRequest.findMany({
        where: { userId },
        orderBy: { requestedAt: 'desc' },
    });
};
exports.getUserExportRequests = getUserExportRequests;
/**
 * Get user's data deletion requests
 */
const getUserDeletionRequests = async (userId) => {
    return database_1.prisma.dataDeletionRequest.findMany({
        where: { userId },
        orderBy: { requestedAt: 'desc' },
    });
};
exports.getUserDeletionRequests = getUserDeletionRequests;
//# sourceMappingURL=gdprService.js.map
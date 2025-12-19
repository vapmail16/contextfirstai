/**
 * GDPR Compliance Service
 *
 * Handles data export, deletion, and consent management
 */
import { DeletionType, ConsentType } from '@prisma/client';
/**
 * Request data export
 */
export declare const requestDataExport: (userId: string) => Promise<{
    userId: string;
    id: string;
    expiresAt: Date | null;
    status: import(".prisma/client").$Enums.DataExportStatus;
    errorMessage: string | null;
    requestedAt: Date;
    completedAt: Date | null;
    downloadUrl: string | null;
    fileSize: number | null;
}>;
/**
 * Generate data export (collects all user data)
 */
export declare const generateDataExport: (requestId: string) => Promise<{
    requestId: string;
    downloadUrl: string;
    fileSize: number;
    expiresAt: Date;
    data: {
        user: {
            id: string | undefined;
            email: string | undefined;
            name: string | null | undefined;
            role: import(".prisma/client").$Enums.Role | undefined;
            createdAt: Date | undefined;
            updatedAt: Date | undefined;
        };
        sessions: {
            id: string;
            createdAt: Date;
            expiresAt: Date;
            userAgent: string | null;
            ipAddress: string | null;
        }[];
        auditLogs: {
            action: string;
            resource: string | null;
            createdAt: Date;
            ipAddress: string | null;
        }[];
        notifications: {
            title: string;
            message: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.NotificationStatus;
        }[];
        payments: {
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: import(".prisma/client").$Enums.Currency;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            refunds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PaymentStatus;
                paymentId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                providerRefundId: string | null;
                processedAt: Date | null;
                reason: string | null;
            }[];
        }[];
        subscriptions: {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: import(".prisma/client").$Enums.Currency;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            providerSubId: string | null;
            planId: string;
            planName: string;
            billingCycle: import(".prisma/client").$Enums.BillingCycle;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            cancelAtPeriodEnd: boolean;
            cancelledAt: Date | null;
        }[];
        consents: {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ipAddress: string | null;
            userAgent: string | null;
            consentType: import(".prisma/client").$Enums.ConsentType;
            granted: boolean;
            grantedAt: Date | null;
            revokedAt: Date | null;
            version: string | null;
        }[];
        exportMetadata: {
            requestId: string;
            generatedAt: string;
            format: string;
        };
    };
}>;
/**
 * Request data deletion
 */
export declare const requestDataDeletion: (userId: string, deletionType?: DeletionType, reason?: string) => Promise<{
    confirmationUrl: string;
    userId: string;
    id: string;
    status: import(".prisma/client").$Enums.DataDeletionStatus;
    errorMessage: string | null;
    reason: string | null;
    requestedAt: Date;
    completedAt: Date | null;
    deletionType: import(".prisma/client").$Enums.DeletionType;
    scheduledFor: Date | null;
    confirmedAt: Date | null;
    confirmationToken: string | null;
}>;
/**
 * Confirm data deletion
 */
export declare const confirmDataDeletion: (confirmationToken: string) => Promise<{
    userId: string;
    id: string;
    status: import(".prisma/client").$Enums.DataDeletionStatus;
    errorMessage: string | null;
    reason: string | null;
    requestedAt: Date;
    completedAt: Date | null;
    deletionType: import(".prisma/client").$Enums.DeletionType;
    scheduledFor: Date | null;
    confirmedAt: Date | null;
    confirmationToken: string | null;
}>;
/**
 * Execute data deletion
 */
export declare const executeDataDeletion: (requestId: string) => Promise<{
    userId: string;
    id: string;
    status: import(".prisma/client").$Enums.DataDeletionStatus;
    errorMessage: string | null;
    reason: string | null;
    requestedAt: Date;
    completedAt: Date | null;
    deletionType: import(".prisma/client").$Enums.DeletionType;
    scheduledFor: Date | null;
    confirmedAt: Date | null;
    confirmationToken: string | null;
}>;
/**
 * Grant consent
 */
export declare const grantConsent: (userId: string, consentType: ConsentType, ipAddress?: string, userAgent?: string, version?: string) => Promise<{
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    consentType: import(".prisma/client").$Enums.ConsentType;
    granted: boolean;
    grantedAt: Date | null;
    revokedAt: Date | null;
    version: string | null;
}>;
/**
 * Revoke consent
 */
export declare const revokeConsent: (userId: string, consentType: ConsentType, ipAddress?: string, userAgent?: string) => Promise<{
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    consentType: import(".prisma/client").$Enums.ConsentType;
    granted: boolean;
    grantedAt: Date | null;
    revokedAt: Date | null;
    version: string | null;
}>;
/**
 * Get user consents
 */
export declare const getUserConsents: (userId: string) => Promise<{
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    consentType: import(".prisma/client").$Enums.ConsentType;
    granted: boolean;
    grantedAt: Date | null;
    revokedAt: Date | null;
    version: string | null;
}[]>;
/**
 * Check if user has granted specific consent
 */
export declare const hasConsent: (userId: string, consentType: ConsentType) => Promise<boolean>;
/**
 * Get user's data export requests
 */
export declare const getUserExportRequests: (userId: string) => Promise<{
    userId: string;
    id: string;
    expiresAt: Date | null;
    status: import(".prisma/client").$Enums.DataExportStatus;
    errorMessage: string | null;
    requestedAt: Date;
    completedAt: Date | null;
    downloadUrl: string | null;
    fileSize: number | null;
}[]>;
/**
 * Get user's data deletion requests
 */
export declare const getUserDeletionRequests: (userId: string) => Promise<{
    userId: string;
    id: string;
    status: import(".prisma/client").$Enums.DataDeletionStatus;
    errorMessage: string | null;
    reason: string | null;
    requestedAt: Date;
    completedAt: Date | null;
    deletionType: import(".prisma/client").$Enums.DeletionType;
    scheduledFor: Date | null;
    confirmedAt: Date | null;
    confirmationToken: string | null;
}[]>;
//# sourceMappingURL=gdprService.d.ts.map
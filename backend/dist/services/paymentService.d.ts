/**
 * Payment Service
 *
 * Unified payment service that works with any provider
 */
import { CreatePaymentParams, PaymentProviderType, RefundPaymentParams } from '../types/payment';
import { PaymentStatus } from '@prisma/client';
/**
 * Create a new payment
 */
export declare const createPayment: (params: CreatePaymentParams & {
    provider?: PaymentProviderType;
}) => Promise<{
    clientSecret: string | undefined;
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.PaymentStatus;
    amount: import("@prisma/client/runtime/library").Decimal;
    currency: import(".prisma/client").$Enums.Currency;
    providerPaymentId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    description: string | null;
    provider: import(".prisma/client").$Enums.PaymentProvider;
    errorMessage: string | null;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
    errorCode: string | null;
    refundedAmount: import("@prisma/client/runtime/library").Decimal | null;
    capturedAt: Date | null;
    refundedAt: Date | null;
}>;
/**
 * Capture/confirm a payment
 */
export declare const capturePayment: (paymentId: string, userId: string, amount?: number) => Promise<{
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.PaymentStatus;
    amount: import("@prisma/client/runtime/library").Decimal;
    currency: import(".prisma/client").$Enums.Currency;
    providerPaymentId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    description: string | null;
    provider: import(".prisma/client").$Enums.PaymentProvider;
    errorMessage: string | null;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
    errorCode: string | null;
    refundedAmount: import("@prisma/client/runtime/library").Decimal | null;
    capturedAt: Date | null;
    refundedAt: Date | null;
}>;
/**
 * Refund a payment
 */
export declare const refundPayment: (params: RefundPaymentParams & {
    userId: string;
}) => Promise<{
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
}>;
/**
 * Get payment by ID
 */
export declare const getPayment: (paymentId: string, userId: string) => Promise<{
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
} & {
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: import(".prisma/client").$Enums.PaymentStatus;
    amount: import("@prisma/client/runtime/library").Decimal;
    currency: import(".prisma/client").$Enums.Currency;
    providerPaymentId: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    description: string | null;
    provider: import(".prisma/client").$Enums.PaymentProvider;
    errorMessage: string | null;
    paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
    errorCode: string | null;
    refundedAmount: import("@prisma/client/runtime/library").Decimal | null;
    capturedAt: Date | null;
    refundedAt: Date | null;
}>;
/**
 * Get user's payments
 */
export declare const getUserPayments: (userId: string, page?: number, pageSize?: number, status?: PaymentStatus) => Promise<{
    payments: ({
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
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        providerPaymentId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        description: string | null;
        provider: import(".prisma/client").$Enums.PaymentProvider;
        errorMessage: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        errorCode: string | null;
        refundedAmount: import("@prisma/client/runtime/library").Decimal | null;
        capturedAt: Date | null;
        refundedAt: Date | null;
    })[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}>;
/**
 * Handle webhook event
 */
export declare const handleWebhook: (provider: PaymentProviderType, payload: any, signature: string) => Promise<{
    success: boolean;
    webhookId: string;
}>;
//# sourceMappingURL=paymentService.d.ts.map
"use strict";
/**
 * Payment Service
 *
 * Unified payment service that works with any provider
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.getUserPayments = exports.getPayment = exports.refundPayment = exports.capturePayment = exports.createPayment = void 0;
const database_1 = require("../config/database");
const PaymentProviderFactory_1 = require("../providers/PaymentProviderFactory");
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const auditService_1 = require("./auditService");
/**
 * Create a new payment
 */
const createPayment = async (params) => {
    try {
        const provider = PaymentProviderFactory_1.PaymentProviderFactory.getProvider();
        // Create payment with provider
        const paymentIntent = await provider.createPayment(params);
        // Store in database
        const payment = await database_1.prisma.payment.create({
            data: {
                userId: params.userId,
                provider: (params.provider || provider.name),
                providerPaymentId: paymentIntent.providerPaymentId,
                amount: params.amount,
                currency: params.currency,
                status: mapProviderStatus(paymentIntent.status),
                paymentMethod: params.paymentMethod,
                description: params.description,
                metadata: paymentIntent.metadata || params.metadata,
            },
        });
        // Create audit log
        await (0, auditService_1.createAuditLog)({
            userId: params.userId,
            action: 'PAYMENT_CREATED',
            resource: 'payments',
            resourceId: payment.id,
            details: {
                amount: params.amount,
                currency: params.currency,
                provider: provider.name,
            },
        });
        logger_1.default.info('Payment created', {
            paymentId: payment.id,
            userId: params.userId,
            amount: params.amount,
            provider: provider.name,
        });
        return {
            ...payment,
            clientSecret: paymentIntent.clientSecret,
        };
    }
    catch (error) {
        logger_1.default.error('Payment creation failed', {
            error: error.message,
            userId: params.userId,
        });
        throw new errors_1.AppError(`Payment creation failed: ${error.message}`, 500);
    }
};
exports.createPayment = createPayment;
/**
 * Capture/confirm a payment
 */
const capturePayment = async (paymentId, userId, amount) => {
    try {
        // Get payment from database
        const payment = await database_1.prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new errors_1.NotFoundError('Payment not found');
        }
        if (payment.userId !== userId) {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        if (payment.status === client_1.PaymentStatus.SUCCEEDED) {
            throw new errors_1.AppError('Payment already captured', 400);
        }
        // Capture with provider
        const provider = PaymentProviderFactory_1.PaymentProviderFactory.getProvider();
        const paymentIntent = await provider.capturePayment({
            paymentId: payment.providerPaymentId,
            amount,
        });
        // Update database
        const updatedPayment = await database_1.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: mapProviderStatus(paymentIntent.status),
                capturedAt: new Date(),
            },
        });
        // Create audit log
        await (0, auditService_1.createAuditLog)({
            userId,
            action: 'PAYMENT_CAPTURED',
            resource: 'payments',
            resourceId: payment.id,
            details: {
                amount: amount || payment.amount,
                capturedAmount: amount,
            },
        });
        logger_1.default.info('Payment captured', {
            paymentId: payment.id,
            userId,
        });
        return updatedPayment;
    }
    catch (error) {
        logger_1.default.error('Payment capture failed', {
            error: error.message,
            paymentId,
        });
        throw error;
    }
};
exports.capturePayment = capturePayment;
/**
 * Refund a payment
 */
const refundPayment = async (params) => {
    try {
        // Get payment from database
        const payment = await database_1.prisma.payment.findUnique({
            where: { id: params.paymentId },
        });
        if (!payment) {
            throw new errors_1.NotFoundError('Payment not found');
        }
        if (payment.userId !== params.userId) {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        if (payment.status !== client_1.PaymentStatus.SUCCEEDED) {
            throw new errors_1.AppError('Payment not eligible for refund', 400);
        }
        // Create refund with provider
        const provider = PaymentProviderFactory_1.PaymentProviderFactory.getProvider();
        const refundResult = await provider.refundPayment({
            paymentId: payment.providerPaymentId,
            amount: params.amount,
            reason: params.reason,
        });
        // Store refund in database
        const refund = await database_1.prisma.paymentRefund.create({
            data: {
                paymentId: payment.id,
                providerRefundId: refundResult.providerRefundId,
                amount: refundResult.amount,
                reason: params.reason,
                status: mapProviderStatus(refundResult.status),
                processedAt: new Date(),
            },
        });
        // Update payment status
        const refundedAmount = Number(payment.refundedAmount || 0) + refundResult.amount;
        const isFullRefund = refundedAmount >= Number(payment.amount);
        await database_1.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: isFullRefund ? client_1.PaymentStatus.REFUNDED : client_1.PaymentStatus.PARTIALLY_REFUNDED,
                refundedAmount,
                refundedAt: new Date(),
            },
        });
        // Create audit log
        await (0, auditService_1.createAuditLog)({
            userId: params.userId,
            action: 'PAYMENT_REFUNDED',
            resource: 'payments',
            resourceId: payment.id,
            details: {
                refundId: refund.id,
                amount: refundResult.amount,
                reason: params.reason,
            },
        });
        logger_1.default.info('Payment refunded', {
            paymentId: payment.id,
            refundId: refund.id,
            amount: refundResult.amount,
        });
        return refund;
    }
    catch (error) {
        logger_1.default.error('Payment refund failed', {
            error: error.message,
            paymentId: params.paymentId,
        });
        throw error;
    }
};
exports.refundPayment = refundPayment;
/**
 * Get payment by ID
 */
const getPayment = async (paymentId, userId) => {
    const payment = await database_1.prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            refunds: true,
        },
    });
    if (!payment) {
        throw new errors_1.NotFoundError('Payment not found');
    }
    if (payment.userId !== userId) {
        throw new errors_1.AppError('Unauthorized', 403);
    }
    return payment;
};
exports.getPayment = getPayment;
/**
 * Get user's payments
 */
const getUserPayments = async (userId, page = 1, pageSize = 10, status) => {
    const skip = (page - 1) * pageSize;
    const where = { userId };
    if (status) {
        where.status = status;
    }
    const [payments, totalCount] = await database_1.prisma.$transaction([
        database_1.prisma.payment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
            include: {
                refunds: true,
            },
        }),
        database_1.prisma.payment.count({ where }),
    ]);
    return {
        payments,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
    };
};
exports.getUserPayments = getUserPayments;
/**
 * Handle webhook event
 */
const handleWebhook = async (provider, payload, signature) => {
    try {
        const providerInstance = PaymentProviderFactory_1.PaymentProviderFactory.createProvider(provider, {
            apiKey: process.env[`${provider}_API_KEY`] || '',
            webhookSecret: process.env[`${provider}_WEBHOOK_SECRET`] || '',
        });
        // Verify webhook signature
        const isValid = providerInstance.verifyWebhook({
            payload,
            signature,
            secret: process.env[`${provider}_WEBHOOK_SECRET`] || '',
        });
        if (!isValid) {
            throw new errors_1.AppError('Invalid webhook signature', 401);
        }
        // Parse webhook event
        const event = providerInstance.parseWebhookEvent(payload);
        // Store webhook log
        const webhookLog = await database_1.prisma.paymentWebhookLog.create({
            data: {
                provider: provider,
                eventType: event.type,
                eventId: event.id,
                payload: event.data,
                signature,
                verified: true,
                processed: false,
            },
        });
        // Process webhook based on event type
        await processWebhookEvent(webhookLog.id, event);
        logger_1.default.info('Webhook processed', {
            provider,
            eventType: event.type,
            webhookId: webhookLog.id,
        });
        return { success: true, webhookId: webhookLog.id };
    }
    catch (error) {
        logger_1.default.error('Webhook processing failed', {
            provider,
            error: error.message,
        });
        throw error;
    }
};
exports.handleWebhook = handleWebhook;
/**
 * Process webhook event
 */
async function processWebhookEvent(webhookId, event) {
    // Handle different event types
    // This is provider-agnostic - implement based on your needs
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
            case 'payment.captured':
                // Update payment status
                await updatePaymentFromWebhook(event.data.id, client_1.PaymentStatus.SUCCEEDED);
                break;
            case 'payment_intent.payment_failed':
            case 'payment.failed':
                await updatePaymentFromWebhook(event.data.id, client_1.PaymentStatus.FAILED);
                break;
            case 'charge.refunded':
            case 'refund.processed':
                // Handle refund
                break;
            default:
                logger_1.default.info('Unhandled webhook event type', { type: event.type });
        }
        // Mark webhook as processed
        await database_1.prisma.paymentWebhookLog.update({
            where: { id: webhookId },
            data: { processed: true, processedAt: new Date() },
        });
    }
    catch (error) {
        await database_1.prisma.paymentWebhookLog.update({
            where: { id: webhookId },
            data: {
                processed: false,
                errorMessage: error.message,
            },
        });
        throw error;
    }
}
/**
 * Update payment from webhook
 */
async function updatePaymentFromWebhook(providerPaymentId, status) {
    await database_1.prisma.payment.updateMany({
        where: { providerPaymentId },
        data: { status },
    });
}
/**
 * Map provider status to our status enum
 */
function mapProviderStatus(providerStatus) {
    const statusMap = {
        'pending': client_1.PaymentStatus.PENDING,
        'processing': client_1.PaymentStatus.PROCESSING,
        'succeeded': client_1.PaymentStatus.SUCCEEDED,
        'success': client_1.PaymentStatus.SUCCEEDED,
        'captured': client_1.PaymentStatus.SUCCEEDED,
        'paid': client_1.PaymentStatus.SUCCEEDED,
        'SUCCESS': client_1.PaymentStatus.SUCCEEDED,
        'failed': client_1.PaymentStatus.FAILED,
        'FAILED': client_1.PaymentStatus.FAILED,
        'canceled': client_1.PaymentStatus.CANCELLED,
        'cancelled': client_1.PaymentStatus.CANCELLED,
        'refunded': client_1.PaymentStatus.REFUNDED,
    };
    return statusMap[providerStatus] || client_1.PaymentStatus.PENDING;
}
//# sourceMappingURL=paymentService.js.map
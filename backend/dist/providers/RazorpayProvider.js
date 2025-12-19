"use strict";
/**
 * Razorpay Payment Provider
 *
 * Implementation of IPaymentProvider for Razorpay
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayProvider = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../utils/logger"));
class RazorpayProvider {
    constructor() {
        this.name = 'RAZORPAY';
        this.razorpay = null;
        this.webhookSecret = '';
    }
    /**
     * Initialize Razorpay with credentials
     */
    initialize(config) {
        const keyId = config.keyId;
        const keySecret = config.keySecret;
        if (!keyId || !keySecret) {
            throw new Error('Razorpay key_id and key_secret are required');
        }
        this.razorpay = new razorpay_1.default({
            key_id: keyId,
            key_secret: keySecret,
        });
        this.webhookSecret = config.webhookSecret || '';
        logger_1.default.info('Razorpay provider initialized');
    }
    /**
     * Create a payment order
     */
    async createPayment(params) {
        if (!this.razorpay) {
            throw new Error('Razorpay not initialized');
        }
        try {
            const amount = Math.round(params.amount * 100); // Convert to paise (for INR)
            const order = await this.razorpay.orders.create({
                amount,
                currency: params.currency,
                receipt: `receipt_${Date.now()}`,
                notes: {
                    userId: params.userId,
                    description: params.description || '',
                    ...params.metadata,
                },
            });
            logger_1.default.info('Razorpay order created', {
                orderId: order.id,
                amount: params.amount,
                currency: params.currency,
            });
            return {
                id: order.id,
                amount: params.amount,
                currency: params.currency,
                status: order.status,
                providerPaymentId: order.id,
                metadata: order.notes,
            };
        }
        catch (error) {
            logger_1.default.error('Razorpay order creation failed', {
                error: error.message,
                code: error.error?.code,
            });
            throw error;
        }
    }
    /**
     * Capture/fetch payment details
     */
    async capturePayment(params) {
        if (!this.razorpay) {
            throw new Error('Razorpay not initialized');
        }
        try {
            // In Razorpay, payments are auto-captured by default
            // We fetch the payment to get its current status
            const payment = await this.razorpay.payments.fetch(params.paymentId);
            logger_1.default.info('Razorpay payment fetched', {
                paymentId: payment.id,
                amount: Number(payment.amount) / 100,
                status: payment.status,
            });
            return {
                id: payment.id,
                amount: Number(payment.amount) / 100,
                currency: payment.currency.toUpperCase(),
                status: payment.status,
                providerPaymentId: payment.id,
                metadata: payment.notes || {},
            };
        }
        catch (error) {
            logger_1.default.error('Razorpay payment fetch failed', {
                paymentId: params.paymentId,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Refund a payment
     */
    async refundPayment(params) {
        if (!this.razorpay) {
            throw new Error('Razorpay not initialized');
        }
        try {
            const refundParams = {
                notes: {
                    reason: params.reason || 'Customer requested refund',
                },
            };
            if (params.amount) {
                refundParams.amount = Math.round(params.amount * 100);
            }
            const refund = await this.razorpay.payments.refund(params.paymentId, refundParams);
            logger_1.default.info('Razorpay refund created', {
                refundId: refund.id,
                paymentId: params.paymentId,
                amount: Number(refund.amount || 0) / 100,
                status: refund.status,
            });
            return {
                id: refund.id,
                paymentId: params.paymentId,
                amount: Number(refund.amount || 0) / 100,
                status: refund.status || 'pending',
                providerRefundId: refund.id,
            };
        }
        catch (error) {
            logger_1.default.error('Razorpay refund failed', {
                paymentId: params.paymentId,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Get payment status
     */
    async getPaymentStatus(paymentId) {
        if (!this.razorpay) {
            throw new Error('Razorpay not initialized');
        }
        try {
            const payment = await this.razorpay.payments.fetch(paymentId);
            return {
                id: payment.id,
                amount: Number(payment.amount) / 100,
                currency: payment.currency.toUpperCase(),
                status: payment.status,
                providerPaymentId: payment.id,
                metadata: payment.notes || {},
            };
        }
        catch (error) {
            logger_1.default.error('Razorpay payment status retrieval failed', {
                paymentId,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Verify webhook signature
     */
    verifyWebhook(params) {
        if (!this.webhookSecret) {
            logger_1.default.warn('Razorpay webhook secret not configured');
            return false;
        }
        try {
            const payload = typeof params.payload === 'string'
                ? params.payload
                : JSON.stringify(params.payload);
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.webhookSecret)
                .update(payload)
                .digest('hex');
            return expectedSignature === params.signature;
        }
        catch (error) {
            logger_1.default.error('Razorpay webhook verification failed', {
                error: error.message,
            });
            return false;
        }
    }
    /**
     * Parse webhook event
     */
    parseWebhookEvent(payload) {
        const event = payload.event || payload.eventType || 'unknown';
        const data = payload.payload || payload;
        return {
            id: data.id || `event_${Date.now()}`,
            type: event,
            data: data,
        };
    }
}
exports.RazorpayProvider = RazorpayProvider;
//# sourceMappingURL=RazorpayProvider.js.map
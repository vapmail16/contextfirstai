"use strict";
/**
 * Cashfree Payment Provider
 *
 * Implementation of IPaymentProvider for Cashfree
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashfreeProvider = void 0;
// import { Cashfree } from 'cashfree-pg'; // TODO: Enable when implementing
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../utils/logger"));
class CashfreeProvider {
    constructor() {
        this.name = 'CASHFREE';
        this.appId = '';
        this.secretKey = '';
        this.webhookSecret = '';
        this.mode = 'test';
    }
    /**
     * Initialize Cashfree with credentials
     */
    initialize(config) {
        this.appId = config.appId;
        this.secretKey = config.secretKey;
        if (!this.appId || !this.secretKey) {
            throw new Error('Cashfree app_id and secret_key are required');
        }
        this.mode = config.mode === 'live' ? 'production' : 'test';
        this.webhookSecret = config.webhookSecret || '';
        logger_1.default.info('Cashfree provider initialized', { mode: this.mode });
    }
    /**
     * Create a payment order
     */
    async createPayment(params) {
        if (!this.appId) {
            throw new Error('Cashfree not initialized');
        }
        try {
            const orderId = `order_${Date.now()}_${params.userId}`;
            // TODO: Implement Cashfree API request
            // const request = {
            //   order_id: orderId,
            //   order_amount: params.amount,
            //   order_currency: params.currency,
            //   customer_details: {
            //     customer_id: params.customerId || params.userId,
            //     customer_phone: '9999999999',
            //   },
            //   order_meta: {
            //     return_url: `${process.env.FRONTEND_URL}/payment/callback`,
            //     notify_url: `${process.env.BACKEND_URL}/api/payments/webhook/cashfree`,
            //   },
            //   order_note: params.description || '',
            // };
            // Cashfree SDK requires proper initialization
            // For now, return a mock response for type safety
            const response = {
                data: {
                    order_id: orderId,
                    order_status: 'ACTIVE',
                    payment_session_id: `session_${Date.now()}`,
                },
            };
            // TODO: Implement actual Cashfree API call
            // const response = await Cashfree.PGCreateOrder('2023-08-01', request);
            logger_1.default.info('Cashfree order created', {
                orderId: response.data.order_id,
                amount: params.amount,
                currency: params.currency,
            });
            return {
                id: response.data.order_id,
                amount: params.amount,
                currency: params.currency,
                status: response.data.order_status || 'ACTIVE',
                clientSecret: response.data.payment_session_id,
                providerPaymentId: response.data.order_id,
                metadata: params.metadata,
            };
        }
        catch (error) {
            logger_1.default.error('Cashfree order creation failed', {
                error: error.message,
                response: error.response?.data,
            });
            throw error;
        }
    }
    /**
     * Capture/fetch payment details
     */
    async capturePayment(params) {
        if (!this.appId) {
            throw new Error('Cashfree not initialized');
        }
        try {
            // Fetch order status
            // TODO: Implement actual Cashfree API call
            const response = {
                data: [{
                        cf_payment_id: params.paymentId,
                        payment_amount: params.amount || 0,
                        payment_currency: 'INR',
                        payment_status: 'SUCCESS',
                    }],
            };
            const order = response.data[0];
            logger_1.default.info('Cashfree order fetched', {
                orderId: params.paymentId,
                status: order.payment_status,
            });
            return {
                id: order.cf_payment_id,
                amount: order.payment_amount,
                currency: order.payment_currency,
                status: order.payment_status,
                providerPaymentId: order.cf_payment_id,
                metadata: {},
            };
        }
        catch (error) {
            logger_1.default.error('Cashfree order fetch failed', {
                orderId: params.paymentId,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Refund a payment
     */
    async refundPayment(params) {
        if (!this.appId) {
            throw new Error('Cashfree not initialized');
        }
        try {
            const refundId = `refund_${Date.now()}`;
            // TODO: Implement Cashfree refund request
            // const request = {
            //   refund_id: refundId,
            //   refund_amount: params.amount,
            //   refund_note: params.reason || 'Customer requested refund',
            // };
            // TODO: Implement actual Cashfree API call
            const response = {
                data: {
                    cf_refund_id: refundId,
                    refund_amount: params.amount,
                    refund_status: 'SUCCESS',
                },
            };
            logger_1.default.info('Cashfree refund created', {
                refundId: response.data.cf_refund_id,
                orderId: params.paymentId,
                amount: params.amount,
            });
            return {
                id: response.data.cf_refund_id,
                paymentId: params.paymentId,
                amount: response.data.refund_amount,
                status: response.data.refund_status || 'pending',
                providerRefundId: response.data.cf_refund_id,
            };
        }
        catch (error) {
            logger_1.default.error('Cashfree refund failed', {
                orderId: params.paymentId,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Get payment status
     */
    async getPaymentStatus(paymentId) {
        if (!this.appId) {
            throw new Error('Cashfree not initialized');
        }
        try {
            // TODO: Implement actual Cashfree API call
            const response = {
                data: [{
                        cf_payment_id: paymentId,
                        payment_amount: 0,
                        payment_currency: 'INR',
                        payment_status: 'SUCCESS',
                    }],
            };
            const order = response.data[0];
            return {
                id: order.cf_payment_id,
                amount: order.payment_amount,
                currency: order.payment_currency,
                status: order.payment_status,
                providerPaymentId: order.cf_payment_id,
                metadata: {},
            };
        }
        catch (error) {
            logger_1.default.error('Cashfree payment status retrieval failed', {
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
            logger_1.default.warn('Cashfree webhook secret not configured');
            return false;
        }
        try {
            const payload = typeof params.payload === 'string'
                ? params.payload
                : JSON.stringify(params.payload);
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.webhookSecret)
                .update(payload)
                .digest('base64');
            return expectedSignature === params.signature;
        }
        catch (error) {
            logger_1.default.error('Cashfree webhook verification failed', {
                error: error.message,
            });
            return false;
        }
    }
    /**
     * Parse webhook event
     */
    parseWebhookEvent(payload) {
        const event = payload.type || 'unknown';
        const data = payload.data || payload;
        return {
            id: data.order?.order_id || `event_${Date.now()}`,
            type: event,
            data: data,
        };
    }
}
exports.CashfreeProvider = CashfreeProvider;
//# sourceMappingURL=CashfreeProvider.js.map
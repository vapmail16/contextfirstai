"use strict";
/**
 * Stripe Payment Provider
 *
 * Implementation of IPaymentProvider for Stripe
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeProvider = void 0;
const stripe_1 = __importDefault(require("stripe"));
const logger_1 = __importDefault(require("../utils/logger"));
class StripeProvider {
    constructor() {
        this.name = 'STRIPE';
        this.stripe = null;
        this.webhookSecret = '';
    }
    /**
     * Initialize Stripe with API key
     */
    initialize(config) {
        const apiKey = config.apiKey;
        if (!apiKey) {
            throw new Error('Stripe API key is required');
        }
        this.stripe = new stripe_1.default(apiKey, {
            // Don't specify apiVersion - let Stripe use the default for the installed package version
            // This avoids version mismatch errors when the package is updated
            typescript: true,
        });
        this.webhookSecret = config.webhookSecret || '';
        logger_1.default.info('Stripe provider initialized');
    }
    /**
     * Create a payment intent
     */
    async createPayment(params) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }
        try {
            const amount = Math.round(params.amount * 100); // Convert to cents
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount,
                currency: params.currency.toLowerCase(),
                description: params.description,
                metadata: {
                    userId: params.userId,
                    ...params.metadata,
                },
                customer: params.customerId,
                capture_method: 'manual', // Manual capture for review
            });
            logger_1.default.info('Stripe payment created', {
                paymentId: paymentIntent.id,
                amount: params.amount,
                currency: params.currency,
            });
            return {
                id: paymentIntent.id,
                amount: params.amount,
                currency: params.currency,
                status: paymentIntent.status,
                clientSecret: paymentIntent.client_secret || undefined,
                providerPaymentId: paymentIntent.id,
                metadata: paymentIntent.metadata,
            };
        }
        catch (error) {
            logger_1.default.error('Stripe payment creation failed', {
                error: error.message,
                code: error.code,
            });
            throw error;
        }
    }
    /**
     * Capture/confirm a payment
     */
    async capturePayment(params) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }
        try {
            const captureParams = {};
            if (params.amount) {
                captureParams.amount_to_capture = Math.round(params.amount * 100);
            }
            const paymentIntent = await this.stripe.paymentIntents.capture(params.paymentId, captureParams);
            logger_1.default.info('Stripe payment captured', {
                paymentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                status: paymentIntent.status,
            });
            return {
                id: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency.toUpperCase(),
                status: paymentIntent.status,
                providerPaymentId: paymentIntent.id,
                metadata: paymentIntent.metadata,
            };
        }
        catch (error) {
            logger_1.default.error('Stripe payment capture failed', {
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
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }
        try {
            const refundParams = {
                payment_intent: params.paymentId,
            };
            if (params.amount) {
                refundParams.amount = Math.round(params.amount * 100);
            }
            if (params.reason) {
                refundParams.reason = params.reason;
            }
            const refund = await this.stripe.refunds.create(refundParams);
            logger_1.default.info('Stripe refund created', {
                refundId: refund.id,
                paymentId: params.paymentId,
                amount: refund.amount / 100,
                status: refund.status,
            });
            return {
                id: refund.id,
                paymentId: params.paymentId,
                amount: refund.amount / 100,
                status: refund.status || 'pending',
                providerRefundId: refund.id,
            };
        }
        catch (error) {
            logger_1.default.error('Stripe refund failed', {
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
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
            return {
                id: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency.toUpperCase(),
                status: paymentIntent.status,
                providerPaymentId: paymentIntent.id,
                metadata: paymentIntent.metadata,
            };
        }
        catch (error) {
            logger_1.default.error('Stripe payment status retrieval failed', {
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
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }
        if (!this.webhookSecret) {
            logger_1.default.warn('Stripe webhook secret not configured');
            return false;
        }
        try {
            const event = this.stripe.webhooks.constructEvent(params.payload, params.signature, this.webhookSecret);
            return !!event;
        }
        catch (error) {
            logger_1.default.error('Stripe webhook verification failed', {
                error: error.message,
            });
            return false;
        }
    }
    /**
     * Parse webhook event
     */
    parseWebhookEvent(payload) {
        const event = payload;
        return {
            id: event.id,
            type: event.type,
            data: event.data.object,
        };
    }
}
exports.StripeProvider = StripeProvider;
//# sourceMappingURL=StripeProvider.js.map
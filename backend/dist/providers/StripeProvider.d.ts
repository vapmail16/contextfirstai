/**
 * Stripe Payment Provider
 *
 * Implementation of IPaymentProvider for Stripe
 */
import { IPaymentProvider, PaymentProviderType, CreatePaymentParams, PaymentIntent, CapturePaymentParams, RefundPaymentParams, RefundResult, VerifyWebhookParams, WebhookEvent } from '../types/payment';
export declare class StripeProvider implements IPaymentProvider {
    readonly name: PaymentProviderType;
    private stripe;
    private webhookSecret;
    /**
     * Initialize Stripe with API key
     */
    initialize(config: Record<string, any>): void;
    /**
     * Create a payment intent
     */
    createPayment(params: CreatePaymentParams): Promise<PaymentIntent>;
    /**
     * Capture/confirm a payment
     */
    capturePayment(params: CapturePaymentParams): Promise<PaymentIntent>;
    /**
     * Refund a payment
     */
    refundPayment(params: RefundPaymentParams): Promise<RefundResult>;
    /**
     * Get payment status
     */
    getPaymentStatus(paymentId: string): Promise<PaymentIntent>;
    /**
     * Verify webhook signature
     */
    verifyWebhook(params: VerifyWebhookParams): boolean;
    /**
     * Parse webhook event
     */
    parseWebhookEvent(payload: any): WebhookEvent;
}
//# sourceMappingURL=StripeProvider.d.ts.map
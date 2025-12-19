/**
 * Razorpay Payment Provider
 *
 * Implementation of IPaymentProvider for Razorpay
 */
import { IPaymentProvider, PaymentProviderType, CreatePaymentParams, PaymentIntent, CapturePaymentParams, RefundPaymentParams, RefundResult, VerifyWebhookParams, WebhookEvent } from '../types/payment';
export declare class RazorpayProvider implements IPaymentProvider {
    readonly name: PaymentProviderType;
    private razorpay;
    private webhookSecret;
    /**
     * Initialize Razorpay with credentials
     */
    initialize(config: Record<string, any>): void;
    /**
     * Create a payment order
     */
    createPayment(params: CreatePaymentParams): Promise<PaymentIntent>;
    /**
     * Capture/fetch payment details
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
//# sourceMappingURL=RazorpayProvider.d.ts.map
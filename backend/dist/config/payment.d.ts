/**
 * Payment Gateway Configuration
 */
import { ProviderConfig } from '../types/payment';
export declare const paymentConfig: ProviderConfig;
export declare const stripeConfig: {
    apiKey: string;
    webhookSecret: string;
};
export declare const razorpayConfig: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
};
export declare const cashfreeConfig: {
    appId: string;
    secretKey: string;
    webhookSecret: string;
    mode: string;
};
//# sourceMappingURL=payment.d.ts.map
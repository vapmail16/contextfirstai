"use strict";
/**
 * Payment Provider Factory
 *
 * Creates and initializes the appropriate payment provider based on configuration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderFactory = void 0;
const StripeProvider_1 = require("./StripeProvider");
const RazorpayProvider_1 = require("./RazorpayProvider");
const CashfreeProvider_1 = require("./CashfreeProvider");
const payment_1 = require("../config/payment");
const logger_1 = __importDefault(require("../utils/logger"));
class PaymentProviderFactory {
    /**
     * Get or create payment provider instance (singleton)
     */
    static getProvider(config) {
        if (this.instance) {
            return this.instance;
        }
        const providerConfig = config || payment_1.paymentConfig;
        const providerType = providerConfig.provider;
        logger_1.default.info('Initializing payment provider', { provider: providerType });
        let provider;
        switch (providerType) {
            case 'STRIPE':
                provider = new StripeProvider_1.StripeProvider();
                provider.initialize({
                    apiKey: payment_1.stripeConfig.apiKey,
                    webhookSecret: payment_1.stripeConfig.webhookSecret,
                });
                break;
            case 'RAZORPAY':
                provider = new RazorpayProvider_1.RazorpayProvider();
                provider.initialize({
                    keyId: payment_1.razorpayConfig.keyId,
                    keySecret: payment_1.razorpayConfig.keySecret,
                    webhookSecret: payment_1.razorpayConfig.webhookSecret,
                });
                break;
            case 'CASHFREE':
                provider = new CashfreeProvider_1.CashfreeProvider();
                provider.initialize({
                    appId: payment_1.cashfreeConfig.appId,
                    secretKey: payment_1.cashfreeConfig.secretKey,
                    mode: payment_1.cashfreeConfig.mode,
                    webhookSecret: payment_1.cashfreeConfig.webhookSecret,
                });
                break;
            default:
                throw new Error(`Unsupported payment provider: ${providerType}`);
        }
        this.instance = provider;
        return provider;
    }
    /**
     * Reset the provider instance (useful for testing)
     */
    static resetProvider() {
        this.instance = null;
    }
    /**
     * Get a specific provider without caching (for testing multiple providers)
     */
    static createProvider(providerType, config) {
        let provider;
        switch (providerType) {
            case 'STRIPE':
                provider = new StripeProvider_1.StripeProvider();
                break;
            case 'RAZORPAY':
                provider = new RazorpayProvider_1.RazorpayProvider();
                break;
            case 'CASHFREE':
                provider = new CashfreeProvider_1.CashfreeProvider();
                break;
            default:
                throw new Error(`Unsupported payment provider: ${providerType}`);
        }
        provider.initialize(config);
        return provider;
    }
}
exports.PaymentProviderFactory = PaymentProviderFactory;
PaymentProviderFactory.instance = null;
//# sourceMappingURL=PaymentProviderFactory.js.map
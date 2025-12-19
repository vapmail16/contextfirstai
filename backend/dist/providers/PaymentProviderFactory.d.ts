/**
 * Payment Provider Factory
 *
 * Creates and initializes the appropriate payment provider based on configuration
 */
import { IPaymentProvider, PaymentProviderType, ProviderConfig } from '../types/payment';
export declare class PaymentProviderFactory {
    private static instance;
    /**
     * Get or create payment provider instance (singleton)
     */
    static getProvider(config?: ProviderConfig): IPaymentProvider;
    /**
     * Reset the provider instance (useful for testing)
     */
    static resetProvider(): void;
    /**
     * Get a specific provider without caching (for testing multiple providers)
     */
    static createProvider(providerType: PaymentProviderType, config: Record<string, any>): IPaymentProvider;
}
//# sourceMappingURL=PaymentProviderFactory.d.ts.map
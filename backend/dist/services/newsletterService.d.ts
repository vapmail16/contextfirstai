/**
 * Newsletter Service
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */
export declare class NewsletterService {
    static subscribe(email: string): Promise<{
        id: string;
        email: string;
        isActive: boolean;
        subscribedAt: Date;
        unsubscribedAt: Date | null;
    }>;
    static unsubscribe(email: string): Promise<{
        id: string;
        email: string;
        isActive: boolean;
        subscribedAt: Date;
        unsubscribedAt: Date | null;
    }>;
}
//# sourceMappingURL=newsletterService.d.ts.map
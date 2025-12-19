/**
 * Contact Service
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */
export declare class ContactService {
    static submitContactForm(data: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<{
        message: string;
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        status: string;
    }>;
}
//# sourceMappingURL=contactService.d.ts.map
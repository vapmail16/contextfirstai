export declare const createTestUser: (overrides?: any) => Promise<{
    id: string;
    email: string;
    password: string;
    name: string | null;
    role: import(".prisma/client").$Enums.Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createTestAdmin: (overrides?: any) => Promise<{
    id: string;
    email: string;
    password: string;
    name: string | null;
    role: import(".prisma/client").$Enums.Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getAuthToken: (userId: string) => Promise<string>;
//# sourceMappingURL=setup.d.ts.map
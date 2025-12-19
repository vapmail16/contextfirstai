/**
 * Hash password
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Compare password with hash
 */
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Generate access and refresh tokens
 */
export declare const generateTokens: (userId: string) => {
    accessToken: string;
    refreshToken: string;
};
/**
 * Register a new user
 */
export declare const register: (email: string, password: string, name?: string, ipAddress?: string, userAgent?: string) => Promise<{
    id: string;
    email: string;
    name: string | null;
    role: import(".prisma/client").$Enums.Role;
    createdAt: Date;
}>;
/**
 * Login user
 */
export declare const login: (email: string, password: string, ipAddress?: string, userAgent?: string) => Promise<{
    user: {
        id: string;
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
    };
    accessToken: string;
    refreshToken: string;
}>;
/**
 * Refresh access token
 */
export declare const refreshAccessToken: (refreshToken: string) => Promise<{
    accessToken: string;
}>;
/**
 * Logout user (delete session)
 */
export declare const logout: (refreshToken: string) => Promise<void>;
/**
 * Get user by ID
 */
export declare const getUserById: (userId: string) => Promise<{
    id: string;
    email: string;
    name: string | null;
    role: import(".prisma/client").$Enums.Role;
    createdAt: Date;
}>;
//# sourceMappingURL=authService.d.ts.map
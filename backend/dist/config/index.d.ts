export declare const config: {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    cookie: {
        domain: string;
        secure: boolean;
        httpOnly: boolean;
        sameSite: "strict";
        maxAge: number;
    };
    frontendUrl: string;
    allowedOrigins: string[];
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        authMaxRequests: number;
    };
    logLevel: string;
    email: {
        apiKey: string | undefined;
        fromEmail: string;
    };
    appName: string;
    architectureMode: string;
    features: {
        registration: boolean;
        passwordReset: boolean;
        emailVerification: boolean;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map
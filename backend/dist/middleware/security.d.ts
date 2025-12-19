import cors from 'cors';
/**
 * Security headers middleware (Helmet)
 */
export declare const securityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
/**
 * CORS configuration
 * Allows multiple origins for development (frontend can run on different ports)
 */
export declare const corsConfig: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Request size limiter
 * Prevent large payloads
 */
export declare const requestSizeLimit = "10mb";
//# sourceMappingURL=security.d.ts.map
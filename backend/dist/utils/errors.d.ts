/**
 * Base application error class
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
/**
 * 400 Bad Request - Validation errors
 */
export declare class ValidationError extends AppError {
    constructor(message?: string);
}
/**
 * 401 Unauthorized - Authentication required
 */
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
/**
 * 403 Forbidden - Insufficient permissions
 */
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
/**
 * 404 Not Found - Resource not found
 */
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
/**
 * 409 Conflict - Resource already exists
 */
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export declare class TooManyRequestsError extends AppError {
    constructor(message?: string);
}
/**
 * 500 Internal Server Error - Something went wrong
 */
export declare class InternalServerError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map
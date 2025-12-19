"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.TooManyRequestsError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
/**
 * Base application error class
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
        // Set the prototype explicitly to maintain instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
/**
 * 400 Bad Request - Validation errors
 */
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
/**
 * 401 Unauthorized - Authentication required
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * 403 Forbidden - Insufficient permissions
 */
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * 404 Not Found - Resource not found
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 409 Conflict - Resource already exists
 */
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
exports.ConflictError = ConflictError;
/**
 * 429 Too Many Requests - Rate limit exceeded
 */
class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
        Object.setPrototypeOf(this, TooManyRequestsError.prototype);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
/**
 * 500 Internal Server Error - Something went wrong
 */
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, false); // Not operational
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=errors.js.map
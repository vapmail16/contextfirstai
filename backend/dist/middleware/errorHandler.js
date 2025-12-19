"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../config"));
/**
 * Global error handler middleware
 * Catches all errors and sends appropriate response
 */
const errorHandler = (err, req, res, _next) => {
    const requestId = req.id;
    const userId = req.user?.id;
    // Determine status code
    let statusCode = 500;
    let message = 'Internal server error';
    let isOperational = false;
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }
    // Log error with context
    logger_1.default.error('Request error', {
        error: err.message,
        stack: err.stack,
        requestId,
        userId,
        method: req.method,
        path: req.path,
        statusCode,
        isOperational,
    });
    // Send error response
    const errorResponse = {
        success: false,
        error: message,
        requestId,
    };
    // Include stack trace in development
    if (config_1.default.nodeEnv === 'development' && err.stack) {
        errorResponse.stack = err.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
//# sourceMappingURL=errorHandler.js.map
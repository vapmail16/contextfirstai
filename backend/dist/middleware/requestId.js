"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = void 0;
const uuid_1 = require("uuid");
/**
 * Request ID middleware
 * Generates or extracts request ID from headers and adds it to request and response
 */
const requestId = (req, res, next) => {
    // Get request ID from header or generate new one
    const reqId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    // Add to request object
    req.id = reqId;
    // Add to response headers
    res.setHeader('X-Request-ID', reqId);
    next();
};
exports.requestId = requestId;
exports.default = exports.requestId;
//# sourceMappingURL=requestId.js.map
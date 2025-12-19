"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const security_1 = require("./middleware/security");
const requestId_1 = __importDefault(require("./middleware/requestId"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./utils/logger"));
// Create Express app
const app = (0, express_1.default)();
// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);
// Apply security middleware
app.use(security_1.securityHeaders);
app.use(security_1.corsConfig);
// Body parsers
app.use(express_1.default.json({ limit: security_1.requestSizeLimit }));
app.use(express_1.default.urlencoded({ extended: true, limit: security_1.requestSizeLimit }));
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Request ID middleware
app.use(requestId_1.default);
// Apply rate limiting to all routes
app.use('/api', security_1.apiLimiter);
// Request logging
app.use((req, _res, next) => {
    logger_1.default.info('Incoming request', {
        method: req.method,
        path: req.path,
        requestId: req.id,
        ip: req.ip,
    });
    next();
});
// Mount API routes
app.use('/api', routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        requestId: req.id,
    });
});
// Error handler (must be last)
app.use(errorHandler_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map
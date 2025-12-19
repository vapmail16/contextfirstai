"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const config_1 = __importDefault(require("../config"));
// Custom format for console output
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
        metaStr = JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
}));
// JSON format for file output
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json());
// Create logger instance
const logger = winston_1.default.createLogger({
    level: config_1.default.logLevel,
    format: fileFormat,
    transports: [
        // Error log file
        new winston_daily_rotate_file_1.default({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        }),
        // Combined log file
        new winston_daily_rotate_file_1.default({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        }),
    ],
});
// Add console transport in development
if (config_1.default.nodeEnv !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
    }));
}
// PII masking function
function maskPII(data) {
    // Mask email addresses: user@example.com -> u***@example.com
    data = data.replace(/([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '$1***@$2');
    // Mask phone numbers: +1-234-567-8900 -> +1-***-***-8900
    data = data.replace(/(\+\d{1,3}[-.\s]?)?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/g, '$1***-***-$4');
    // Mask credit card numbers: 4111-1111-1111-1111 -> ****-****-****-1111
    data = data.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?(\d{4})\b/g, '****-****-****-$1');
    return data;
}
// Wrap logger methods to mask PII
const wrappedLogger = {
    error: (message, meta) => {
        const maskedMessage = maskPII(message);
        const maskedMeta = meta ? JSON.parse(maskPII(JSON.stringify(meta))) : {};
        logger.error(maskedMessage, maskedMeta);
    },
    warn: (message, meta) => {
        const maskedMessage = maskPII(message);
        const maskedMeta = meta ? JSON.parse(maskPII(JSON.stringify(meta))) : {};
        logger.warn(maskedMessage, maskedMeta);
    },
    info: (message, meta) => {
        const maskedMessage = maskPII(message);
        const maskedMeta = meta ? JSON.parse(maskPII(JSON.stringify(meta))) : {};
        logger.info(maskedMessage, maskedMeta);
    },
    debug: (message, meta) => {
        const maskedMessage = maskPII(message);
        const maskedMeta = meta ? JSON.parse(maskPII(JSON.stringify(meta))) : {};
        logger.debug(maskedMessage, maskedMeta);
    },
};
exports.default = wrappedLogger;
//# sourceMappingURL=logger.js.map
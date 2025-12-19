"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.disconnectDatabase = exports.connectDatabase = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
// Create Prisma client instance
const prisma = new client_1.PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
    ],
});
exports.prisma = prisma;
// Log database queries in development
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        logger_1.default.debug('Database query', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
        });
    });
}
// Log database errors
prisma.$on('error', (e) => {
    logger_1.default.error('Database error', {
        message: e.message,
        target: e.target,
    });
});
// Log database warnings
prisma.$on('warn', (e) => {
    logger_1.default.warn('Database warning', {
        message: e.message,
    });
});
/**
 * Connect to database
 */
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        logger_1.default.info('Database connected successfully');
    }
    catch (error) {
        logger_1.default.error('Database connection failed', { error });
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
/**
 * Disconnect from database
 */
const disconnectDatabase = async () => {
    try {
        await prisma.$disconnect();
        logger_1.default.info('Database disconnected successfully');
    }
    catch (error) {
        logger_1.default.error('Database disconnection failed', { error });
    }
};
exports.disconnectDatabase = disconnectDatabase;
exports.default = prisma;
//# sourceMappingURL=database.js.map
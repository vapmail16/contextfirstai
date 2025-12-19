"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const database_1 = require("./config/database");
const logger_1 = __importDefault(require("./utils/logger"));
/**
 * Start server
 */
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Start HTTP server
        const server = app_1.default.listen(config_1.default.port, () => {
            logger_1.default.info(`Server started`, {
                port: config_1.default.port,
                environment: config_1.default.nodeEnv,
            });
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
            logger_1.default.info(`${signal} received, shutting down gracefully`);
            server.close(async () => {
                logger_1.default.info('HTTP server closed');
                // Disconnect from database
                await (0, database_1.disconnectDatabase)();
                process.exit(0);
            });
            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger_1.default.error('Forcefully shutting down');
                process.exit(1);
            }, 30000);
        };
        // Handle shutdown signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger_1.default.error('Uncaught exception', { error: error.message, stack: error.stack });
            shutdown('uncaughtException');
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason) => {
            logger_1.default.error('Unhandled rejection', { reason });
            shutdown('unhandledRejection');
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server', { error });
        process.exit(1);
    }
};
// Start server if this file is run directly
if (require.main === module) {
    startServer();
}
exports.default = app_1.default;
//# sourceMappingURL=server.js.map
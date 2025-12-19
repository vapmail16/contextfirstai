"use strict";
/**
 * Newsletter Service
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterService = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const emailService = __importStar(require("./emailService"));
class NewsletterService {
    static async subscribe(email) {
        if (!email) {
            throw new errors_1.ValidationError('Email is required');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new errors_1.ValidationError('Invalid email format');
        }
        // Check if already subscribed
        const existing = await database_1.prisma.newsletterSubscription.findUnique({
            where: { email },
        });
        if (existing) {
            if (existing.isActive) {
                throw new errors_1.ValidationError('Email is already subscribed');
            }
            // Reactivate if previously unsubscribed
            const subscription = await database_1.prisma.newsletterSubscription.update({
                where: { email },
                data: { isActive: true, unsubscribedAt: null },
            });
            logger_1.default.info('Newsletter subscription reactivated', { email });
            // Send confirmation email on reactivation
            try {
                await emailService.sendNewsletterConfirmationEmail({ email });
            }
            catch (error) {
                logger_1.default.error('Failed to send newsletter confirmation email', {
                    email,
                    error: error.message,
                });
            }
            return subscription;
        }
        const subscription = await database_1.prisma.newsletterSubscription.create({
            data: {
                email,
                isActive: true,
            },
        });
        logger_1.default.info('Newsletter subscription created', { email });
        // Send confirmation email
        try {
            await emailService.sendNewsletterConfirmationEmail({ email });
        }
        catch (error) {
            // Log error but don't fail the subscription
            logger_1.default.error('Failed to send newsletter confirmation email', {
                email,
                error: error.message,
            });
        }
        return subscription;
    }
    static async unsubscribe(email) {
        if (!email) {
            throw new errors_1.ValidationError('Email is required');
        }
        const subscription = await database_1.prisma.newsletterSubscription.findUnique({
            where: { email },
        });
        if (!subscription) {
            throw new errors_1.ValidationError('Email not found in subscriptions');
        }
        const updated = await database_1.prisma.newsletterSubscription.update({
            where: { email },
            data: {
                isActive: false,
                unsubscribedAt: new Date(),
            },
        });
        logger_1.default.info('Newsletter subscription deactivated', { email });
        return updated;
    }
}
exports.NewsletterService = NewsletterService;
//# sourceMappingURL=newsletterService.js.map
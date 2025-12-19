"use strict";
/**
 * Contact Service
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
exports.ContactService = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const emailService = __importStar(require("./emailService"));
class ContactService {
    static async submitContactForm(data) {
        if (!data.name || !data.email || !data.subject || !data.message) {
            throw new errors_1.ValidationError('All fields are required: name, email, subject, message');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new errors_1.ValidationError('Invalid email format');
        }
        const submission = await database_1.prisma.contactSubmission.create({
            data: {
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
                status: 'PENDING',
            },
        });
        logger_1.default.info('Contact submission created', { submissionId: submission.id });
        // Send email notification to admin
        try {
            await emailService.sendContactNotificationEmail({
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
            });
        }
        catch (error) {
            // Log error but don't fail the submission
            logger_1.default.error('Failed to send contact notification email', {
                submissionId: submission.id,
                error: error.message,
            });
        }
        return submission;
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=contactService.js.map
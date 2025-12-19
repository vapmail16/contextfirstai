"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewsletterConfirmationEmail = exports.sendContactNotificationEmail = exports.sendNotificationEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendWelcomeEmail = exports.renderTemplate = void 0;
const resend_1 = require("resend");
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
// Initialize Resend client
let resend = null;
const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY || config_1.default.email.apiKey;
    if (!apiKey || apiKey === 'your-resend-api-key-here') {
        logger_1.default.warn('RESEND_API_KEY not configured, emails will not be sent');
        return null;
    }
    // Always create new client in tests (to pick up mocks)
    if (process.env.NODE_ENV === 'test') {
        return new resend_1.Resend(apiKey);
    }
    if (!resend) {
        resend = new resend_1.Resend(apiKey);
    }
    return resend;
};
/**
 * Mask email for display (PII protection)
 */
const maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    if (!domain)
        return email;
    return `${localPart[0]}***@${domain}`;
};
/**
 * Render email template with data
 */
const renderTemplate = (templateName, data) => {
    try {
        const templatePath = path_1.default.join(__dirname, '../templates/emails', `${templateName}.hbs`);
        if (!fs_1.default.existsSync(templatePath)) {
            throw new Error(`Email template not found: ${templateName}`);
        }
        const templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
        const template = handlebars_1.default.compile(templateSource);
        // Mask email in data for display
        const safeData = {
            ...data,
            email: data.email ? maskEmail(data.email) : data.email,
            year: data.year || new Date().getFullYear(),
            appName: data.appName || process.env.APP_NAME || 'App Template',
        };
        return template(safeData);
    }
    catch (error) {
        logger_1.default.error('Failed to render email template', {
            templateName,
            error: error.message,
        });
        throw new Error(`Failed to render template: ${error.message}`);
    }
};
exports.renderTemplate = renderTemplate;
/**
 * Send email using Resend
 */
const sendEmail = async (options) => {
    const client = getResendClient();
    if (!client) {
        logger_1.default.warn('Email not sent - Resend not configured', {
            to: options.to,
            subject: options.subject,
        });
        return { id: 'mock-email-id' };
    }
    try {
        const result = await client.emails.send({
            from: config_1.default.email.fromEmail,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        // Check if send was successful
        if ('error' in result && result.error) {
            throw new Error(result.error.message);
        }
        logger_1.default.info('Email sent successfully', {
            emailId: result.data?.id,
            to: options.to,
            subject: options.subject,
        });
        return result;
    }
    catch (error) {
        logger_1.default.error('Failed to send email', {
            to: options.to,
            subject: options.subject,
            error: error.message,
        });
        throw new errors_1.InternalServerError('Failed to send email');
    }
};
/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (params) => {
    const html = (0, exports.renderTemplate)('welcome', {
        name: params.name || 'User',
        email: params.to,
        actionUrl: params.actionUrl || `${config_1.default.frontendUrl}/dashboard`,
    });
    return sendEmail({
        to: params.to,
        subject: `Welcome to ${process.env.APP_NAME || 'App Template'}!`,
        html,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
/**
 * Send email verification email
 */
const sendVerificationEmail = async (params) => {
    const verificationUrl = `${config_1.default.frontendUrl}/verify-email?token=${params.token}`;
    const html = (0, exports.renderTemplate)('verify-email', {
        name: params.name || 'User',
        email: params.to,
        verificationUrl,
        expiryHours: 24,
    });
    return sendEmail({
        to: params.to,
        subject: 'Verify Your Email Address',
        html,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (params) => {
    const resetUrl = `${config_1.default.frontendUrl}/reset-password?token=${params.token}`;
    const html = (0, exports.renderTemplate)('reset-password', {
        name: params.name || 'User',
        email: params.to,
        resetUrl,
        expiryHours: 1,
    });
    return sendEmail({
        to: params.to,
        subject: 'Reset Your Password',
        html,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
/**
 * Send generic notification email
 */
const sendNotificationEmail = async (params) => {
    const html = (0, exports.renderTemplate)('notification', {
        name: params.name || 'User',
        email: params.to,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        actionText: params.actionText || 'View Details',
    });
    return sendEmail({
        to: params.to,
        subject: params.subject,
        html,
    });
};
exports.sendNotificationEmail = sendNotificationEmail;
/**
 * Send contact form notification email to admin
 */
const sendContactNotificationEmail = async (params) => {
    const adminEmail = process.env.ADMIN_EMAIL || config_1.default.email.fromEmail;
    const html = (0, exports.renderTemplate)('contact-notification', {
        name: params.name,
        email: params.email,
        subject: params.subject,
        message: params.message,
        appName: process.env.APP_NAME || 'AI Forge Hub',
    });
    return sendEmail({
        to: adminEmail,
        subject: `New Contact Form Submission: ${params.subject}`,
        html,
    });
};
exports.sendContactNotificationEmail = sendContactNotificationEmail;
/**
 * Send newsletter confirmation email
 */
const sendNewsletterConfirmationEmail = async (params) => {
    const html = (0, exports.renderTemplate)('newsletter-confirmation', {
        name: params.name || 'Subscriber',
        email: params.email,
        appName: process.env.APP_NAME || 'AI Forge Hub',
        unsubscribeUrl: `${config_1.default.frontendUrl}/newsletter/unsubscribe?email=${encodeURIComponent(params.email)}`,
    });
    return sendEmail({
        to: params.email,
        subject: `Welcome to ${process.env.APP_NAME || 'AI Forge Hub'} Newsletter!`,
        html,
    });
};
exports.sendNewsletterConfirmationEmail = sendNewsletterConfirmationEmail;
//# sourceMappingURL=emailService.js.map
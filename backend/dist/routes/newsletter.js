"use strict";
/**
 * Newsletter Routes
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const newsletterService_1 = require("../services/newsletterService");
const validation_1 = require("../middleware/validation");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
router.post('/subscribe', (0, validation_1.validate)([
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const subscription = await newsletterService_1.NewsletterService.subscribe(req.body.email);
    return res.status(201).json({
        success: true,
        data: subscription,
        message: 'Successfully subscribed to newsletter',
    });
}));
/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe from newsletter
 */
router.post('/unsubscribe', (0, validation_1.validate)([
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await newsletterService_1.NewsletterService.unsubscribe(req.body.email);
    return res.json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
    });
}));
exports.default = router;
//# sourceMappingURL=newsletter.js.map
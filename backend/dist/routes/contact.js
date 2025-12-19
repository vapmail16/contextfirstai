"use strict";
/**
 * Contact Routes
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const contactService_1 = require("../services/contactService");
const validation_1 = require("../middleware/validation");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
/**
 * POST /api/contact
 * Submit contact form
 */
router.post('/', (0, validation_1.validate)([
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('subject').notEmpty().withMessage('Subject is required'),
    (0, express_validator_1.body)('message').notEmpty().withMessage('Message is required'),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const submission = await contactService_1.ContactService.submitContactForm(req.body);
    return res.status(201).json({
        success: true,
        data: submission,
        message: 'Contact form submitted successfully',
    });
}));
exports.default = router;
//# sourceMappingURL=contact.js.map
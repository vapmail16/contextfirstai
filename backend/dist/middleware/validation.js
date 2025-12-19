"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validators = exports.validate = void 0;
const express_validator_1 = require("express-validator");
/**
 * Validation middleware wrapper
 * Runs validation chains and returns errors if any
 */
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map((validation) => validation.run(req)));
        // Check for errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: errors.array(),
                requestId: req.id,
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
/**
 * Common validation rules
 */
exports.validators = {
    // Email validation
    email: (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail()
        .trim(),
    // Password validation (strong)
    password: (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&#]/)
        .withMessage('Password must contain at least one special character (@$!%*?&#)'),
    // Name validation
    name: (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters'),
    // UUID validation
    uuid: (field) => (0, express_validator_1.body)(field)
        .isUUID()
        .withMessage(`${field} must be a valid UUID`),
};
exports.default = exports.validate;
//# sourceMappingURL=validation.js.map
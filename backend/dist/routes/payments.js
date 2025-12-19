"use strict";
/**
 * Payment API Routes
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
const express_1 = require("express");
const paymentService = __importStar(require("../services/paymentService"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * POST /api/payments
 * Create a new payment
 */
router.post('/', (0, asyncHandler_1.default)(async (req, res) => {
    const payment = await paymentService.createPayment({
        ...req.body,
        userId: req.user.id,
    });
    res.status(201).json({
        success: true,
        data: payment,
    });
}));
/**
 * GET /api/payments
 * Get user's payments
 */
router.get('/', (0, asyncHandler_1.default)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const status = req.query.status;
    const result = await paymentService.getUserPayments(req.user.id, page, pageSize, status);
    res.json({
        success: true,
        data: result,
    });
}));
/**
 * GET /api/payments/:id
 * Get payment by ID
 */
router.get('/:id', (0, asyncHandler_1.default)(async (req, res) => {
    const payment = await paymentService.getPayment(req.params.id, req.user.id);
    res.json({
        success: true,
        data: payment,
    });
}));
/**
 * POST /api/payments/:id/capture
 * Capture a payment
 */
router.post('/:id/capture', (0, asyncHandler_1.default)(async (req, res) => {
    const { amount } = req.body;
    const payment = await paymentService.capturePayment(req.params.id, req.user.id, amount);
    res.json({
        success: true,
        data: payment,
        message: 'Payment captured successfully',
    });
}));
/**
 * POST /api/payments/:id/refund
 * Refund a payment
 */
router.post('/:id/refund', (0, asyncHandler_1.default)(async (req, res) => {
    const refund = await paymentService.refundPayment({
        paymentId: req.params.id,
        userId: req.user.id,
        ...req.body,
    });
    res.json({
        success: true,
        data: refund,
        message: 'Payment refunded successfully',
    });
}));
/**
 * POST /api/payments/webhook/:provider
 * Handle payment webhooks from providers
 * Note: This endpoint should NOT require authentication as it's called by payment providers
 */
router.post('/webhook/:provider', (0, asyncHandler_1.default)(async (req, res) => {
    const provider = req.params.provider.toUpperCase();
    let signature = req.headers['stripe-signature'] ||
        req.headers['x-razorpay-signature'] ||
        req.headers['x-cashfree-signature'];
    // Handle array or string
    if (Array.isArray(signature)) {
        signature = signature[0];
    }
    const result = await paymentService.handleWebhook(provider, req.body, signature || '');
    res.json({
        success: true,
        data: result,
    });
}));
// Admin routes - view all payments
router.get('/admin/all', (0, auth_1.requireRole)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.default)(async (_req, res) => {
    // This would need a separate service function to get all payments
    res.json({
        success: true,
        message: 'Admin payment listing - implement as needed',
    });
}));
exports.default = router;
//# sourceMappingURL=payments.js.map
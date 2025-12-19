"use strict";
/**
 * GDPR Compliance API Routes
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
const gdprService = __importStar(require("../services/gdprService"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * POST /api/gdpr/export
 * Request data export
 */
router.post('/export', (0, asyncHandler_1.default)(async (req, res) => {
    const exportRequest = await gdprService.requestDataExport(req.user.id);
    // Trigger background job to generate export
    // For now, generate immediately
    const exportData = await gdprService.generateDataExport(exportRequest.id);
    res.status(201).json({
        success: true,
        data: exportData,
        message: 'Data export generated successfully. Download link expires in 7 days.',
    });
}));
/**
 * GET /api/gdpr/exports
 * Get user's export requests
 */
router.get('/exports', (0, asyncHandler_1.default)(async (req, res) => {
    const exports = await gdprService.getUserExportRequests(req.user.id);
    res.json({
        success: true,
        data: exports,
    });
}));
/**
 * POST /api/gdpr/deletion
 * Request data deletion
 */
router.post('/deletion', (0, asyncHandler_1.default)(async (req, res) => {
    const { deletionType, reason } = req.body;
    const deletionRequest = await gdprService.requestDataDeletion(req.user.id, deletionType || client_1.DeletionType.SOFT, reason);
    res.status(201).json({
        success: true,
        data: deletionRequest,
        message: 'Data deletion requested. Please check your email to confirm.',
    });
}));
/**
 * GET /api/gdpr/deletions
 * Get user's deletion requests
 */
router.get('/deletions', (0, asyncHandler_1.default)(async (req, res) => {
    const deletions = await gdprService.getUserDeletionRequests(req.user.id);
    res.json({
        success: true,
        data: deletions,
    });
}));
/**
 * POST /api/gdpr/deletion/confirm/:token
 * Confirm data deletion (public endpoint)
 */
router.post('/deletion/confirm/:token', (0, asyncHandler_1.default)(async (req, res) => {
    const { token } = req.params;
    await gdprService.confirmDataDeletion(token);
    res.json({
        success: true,
        message: 'Data deletion confirmed. Your data will be deleted within 24 hours.',
    });
}));
/**
 * POST /api/gdpr/consents
 * Grant consent
 */
router.post('/consents', (0, asyncHandler_1.default)(async (req, res) => {
    const { consentType } = req.body;
    if (!consentType || !Object.values(client_1.ConsentType).includes(consentType)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid consent type',
        });
    }
    const consent = await gdprService.grantConsent(req.user.id, consentType, req.ip, req.headers['user-agent']);
    return res.json({
        success: true,
        data: consent,
        message: 'Consent granted successfully',
    });
}));
/**
 * DELETE /api/gdpr/consents/:consentType
 * Revoke consent
 */
router.delete('/consents/:consentType', (0, asyncHandler_1.default)(async (req, res) => {
    const { consentType } = req.params;
    if (!Object.values(client_1.ConsentType).includes(consentType)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid consent type',
        });
    }
    const consent = await gdprService.revokeConsent(req.user.id, consentType, req.ip, req.headers['user-agent']);
    return res.json({
        success: true,
        data: consent,
        message: 'Consent revoked successfully',
    });
}));
/**
 * GET /api/gdpr/consents
 * Get user's consents
 */
router.get('/consents', (0, asyncHandler_1.default)(async (req, res) => {
    const consents = await gdprService.getUserConsents(req.user.id);
    res.json({
        success: true,
        data: consents,
    });
}));
/**
 * GET /api/gdpr/consents/:consentType/check
 * Check if user has specific consent
 */
router.get('/consents/:consentType/check', (0, asyncHandler_1.default)(async (req, res) => {
    const { consentType } = req.params;
    const hasConsent = await gdprService.hasConsent(req.user.id, consentType);
    res.json({
        success: true,
        data: { hasConsent },
    });
}));
exports.default = router;
//# sourceMappingURL=gdpr.js.map
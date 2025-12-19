"use strict";
/**
 * Upload Routes
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const uploadService_1 = require("../services/uploadService");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
/**
 * POST /api/upload/image
 * Upload an image (Admin only)
 */
router.post('/image', auth_1.authenticate, (0, auth_1.requireRole)('ADMIN', 'SUPER_ADMIN'), upload.single('image'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        res.status(400).json({
            success: false,
            error: 'No file uploaded',
        });
        return;
    }
    logger_1.default.info('POST /api/upload/image', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
    });
    const result = await uploadService_1.UploadService.uploadImage(req.file);
    res.json({
        success: true,
        data: result,
        message: 'Image uploaded successfully',
    });
}));
/**
 * DELETE /api/upload/image/:filename
 * Delete an uploaded image (Admin only)
 */
router.delete('/image/:filename', auth_1.authenticate, (0, auth_1.requireRole)('ADMIN', 'SUPER_ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { filename } = req.params;
    logger_1.default.info('DELETE /api/upload/image/:filename', { filename });
    await uploadService_1.UploadService.deleteImage(filename);
    res.json({
        success: true,
        message: 'Image deleted successfully',
    });
}));
exports.default = router;
//# sourceMappingURL=upload.js.map
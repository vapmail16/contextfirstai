/**
 * Upload Routes
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { UploadService } from '../services/uploadService';
import logger from '../utils/logger';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * POST /api/upload/image
 * Upload an image (Admin only)
 */
router.post(
  '/image',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    logger.info('POST /api/upload/image', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    const result = await UploadService.uploadImage(req.file);

    res.json({
      success: true,
      data: result,
      message: 'Image uploaded successfully',
    });
  })
);

/**
 * DELETE /api/upload/image/:filename
 * Delete an uploaded image (Admin only)
 */
router.delete(
  '/image/:filename',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const { filename } = req.params;

    logger.info('DELETE /api/upload/image/:filename', { filename });

    await UploadService.deleteImage(filename);

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  })
);

export default router;


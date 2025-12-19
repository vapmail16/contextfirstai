/**
 * Upload Service
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { ValidationError } from '../utils/errors';

export interface UploadResult {
  filename: string;
  path: string;
  url: string;
  size: number;
}

export class UploadService {
  private static readonly UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
  private static readonly MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default
  private static readonly ALLOWED_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(',');

  /**
   * Upload an image file
   */
  static async uploadImage(file: { originalname: string; mimetype: string; buffer: Buffer; size: number }): Promise<UploadResult> {
    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new ValidationError(`File type ${file.mimetype} is not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new ValidationError(`File size ${file.size} bytes exceeds maximum allowed size of ${this.MAX_FILE_SIZE} bytes`);
    }

    // Ensure upload directory exists
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(this.UPLOAD_DIR, filename);

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    logger.info('Image uploaded successfully', {
      filename,
      size: file.size,
      mimetype: file.mimetype,
    });

    // Generate URL (relative to public/uploads)
    const url = `/uploads/${filename}`;

    return {
      filename,
      path: filePath,
      url,
      size: file.size,
    };
  }

  /**
   * Delete an uploaded image
   */
  static async deleteImage(filename: string): Promise<void> {
    const filePath = path.join(this.UPLOAD_DIR, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('Image deleted successfully', { filename });
    } else {
      logger.warn('Image file not found for deletion', { filename });
    }
  }

  /**
   * Get image URL
   */
  static getImageUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}


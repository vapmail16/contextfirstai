/**
 * Upload Service Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { UploadService } from '../services/uploadService';

describe('UploadService', () => {
  const testUploadDir = path.join(__dirname, '../../uploads/test');
  const originalEnv = process.env;

  beforeEach(() => {
    // Set test environment
    process.env = {
      ...originalEnv,
      UPLOAD_DIR: testUploadDir,
      MAX_FILE_SIZE: '5242880', // 5MB
      ALLOWED_IMAGE_TYPES: 'image/jpeg,image/png,image/webp,image/gif',
    };

    // Create test upload directory
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
    process.env = originalEnv;
  });

  describe('uploadImage', () => {
    it('should upload a valid image file', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 1024,
      } as any;

      const result = await UploadService.uploadImage(mockFile);

      expect(result).toBeDefined();
      expect(result.url).toContain('uploads');
      expect(result.filename).toBeDefined();
      expect(result.path).toBeDefined();

      // Verify file exists
      expect(fs.existsSync(result.path)).toBe(true);
    });

    it('should reject files that are too large', async () => {
      const mockFile = {
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.alloc(10 * 1024 * 1024), // 10MB
        size: 10 * 1024 * 1024,
      } as any;

      await expect(UploadService.uploadImage(mockFile)).rejects.toThrow(/size|too large/i);
    });

    it('should reject non-image file types', async () => {
      const mockFile = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('fake-pdf-data'),
        size: 1024,
      } as any;

      await expect(UploadService.uploadImage(mockFile)).rejects.toThrow(/type|format/i);
    });

    it('should generate unique filenames', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 1024,
      } as any;

      const result1 = await UploadService.uploadImage(mockFile);
      const result2 = await UploadService.uploadImage(mockFile);

      expect(result1.filename).not.toBe(result2.filename);
    });
  });

  describe('deleteImage', () => {
    it('should delete an uploaded image', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 1024,
      } as any;

      const uploadResult = await UploadService.uploadImage(mockFile);
      expect(fs.existsSync(uploadResult.path)).toBe(true);

      await UploadService.deleteImage(uploadResult.filename);
      expect(fs.existsSync(uploadResult.path)).toBe(false);
    });

    it('should not throw error if file does not exist', async () => {
      await expect(UploadService.deleteImage('non-existent-file.jpg')).resolves.not.toThrow();
    });
  });
});


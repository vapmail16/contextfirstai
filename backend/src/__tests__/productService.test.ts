/**
 * Product Service Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { prisma } from '../config/database';
import { ContentService } from '../services/contentService';
import { ValidationError } from '../utils/errors';

describe('ContentService - Product', () => {
  beforeEach(async () => {
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.product.deleteMany();
    await prisma.$disconnect();
  });

  describe('createProduct', () => {
    it('should create a product with external link', async () => {
      const productData = {
        title: 'PDF Parser',
        description: 'AI-powered PDF parsing tool',
        problemSolved: 'Extract text and data from PDFs',
        status: 'LIVE',
        externalLink: 'https://product.example.com',
        pricing: 'Free tier available',
        featured: false,
        isActive: true,
        displayOrder: 1,
      };

      const product = await ContentService.createProduct(productData);

      expect(product).toBeDefined();
      expect(product.id).toBeDefined();
      expect(product.title).toBe(productData.title);
      expect(product.externalLink).toBe(productData.externalLink);
      expect(product.status).toBe(productData.status);
    });

    it('should throw ValidationError for invalid status', async () => {
      const invalidData = {
        title: 'Test Product',
        description: 'Test',
        problemSolved: 'Problem',
        status: 'INVALID_STATUS',
        externalLink: 'https://example.com',
      };

      await expect(
        ContentService.createProduct(invalidData as any)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getActiveProducts', () => {
    it('should return only active products', async () => {
      await prisma.product.createMany({
        data: [
          {
            title: 'Active Product 1',
            description: 'Description',
            problemSolved: 'Problem',
            status: 'LIVE',
            externalLink: 'https://example.com/1',
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Inactive Product',
            description: 'Description',
            problemSolved: 'Problem',
            status: 'LIVE',
            externalLink: 'https://example.com/2',
            isActive: false,
            displayOrder: 2,
          },
        ],
      });

      const products = await ContentService.getActiveProducts();

      expect(products).toHaveLength(1);
      expect(products[0].isActive).toBe(true);
    });
  });
});


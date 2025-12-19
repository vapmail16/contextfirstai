/**
 * Content Routes Tests
 * TDD Approach: Write tests first (RED phase)
 * 
 * Tests for public content API endpoints
 */

import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { TrainingCategory, TrainingLevel, ProductStatus, KnowledgeCategory, CommunityPlatform } from '@prisma/client';

describe('Content API - Public Endpoints', () => {
  beforeEach(async () => {
    // Clean up before each test
    await prisma.training.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.product.deleteMany();
    await prisma.knowledgeArticle.deleteMany();
    await prisma.communityLink.deleteMany();
  });

  afterAll(async () => {
    await prisma.training.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.product.deleteMany();
    await prisma.knowledgeArticle.deleteMany();
    await prisma.communityLink.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/content/trainings', () => {
    it('should return all active trainings', async () => {
      // Create test data
      await prisma.training.createMany({
        data: [
          {
            title: 'Active Training 1',
            description: 'Description 1',
            category: TrainingCategory.INTRODUCTORY,
            level: TrainingLevel.BEGINNER,
            externalLink: 'https://example.com/1',
            duration: 60,
            price: 0,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Active Training 2',
            description: 'Description 2',
            category: TrainingCategory.TOOL_BASED,
            level: TrainingLevel.INTERMEDIATE,
            externalLink: 'https://example.com/2',
            duration: 120,
            price: 0,
            isActive: true,
            displayOrder: 2,
          },
          {
            title: 'Inactive Training',
            description: 'Description 3',
            category: TrainingCategory.INTRODUCTORY,
            level: TrainingLevel.BEGINNER,
            externalLink: 'https://example.com/3',
            duration: 60,
            price: 0,
            isActive: false,
            displayOrder: 3,
          },
        ],
      });

      const response = await request(app)
        .get('/api/content/trainings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.isActive)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('externalLink');
    });

    it('should return trainings ordered by displayOrder', async () => {
      await prisma.training.createMany({
        data: [
          {
            title: 'Third',
            description: 'Description',
            category: TrainingCategory.INTRODUCTORY,
            level: TrainingLevel.BEGINNER,
            externalLink: 'https://example.com/3',
            duration: 60,
            price: 0,
            isActive: true,
            displayOrder: 3,
          },
          {
            title: 'First',
            description: 'Description',
            category: TrainingCategory.INTRODUCTORY,
            level: TrainingLevel.BEGINNER,
            externalLink: 'https://example.com/1',
            duration: 60,
            price: 0,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Second',
            description: 'Description',
            category: TrainingCategory.INTRODUCTORY,
            level: TrainingLevel.BEGINNER,
            externalLink: 'https://example.com/2',
            duration: 60,
            price: 0,
            isActive: true,
            displayOrder: 2,
          },
        ],
      });

      const response = await request(app)
        .get('/api/content/trainings')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].displayOrder).toBe(1);
      expect(response.body.data[1].displayOrder).toBe(2);
      expect(response.body.data[2].displayOrder).toBe(3);
    });

    it('should return empty array when no active trainings', async () => {
      const response = await request(app)
        .get('/api/content/trainings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/content/trainings/featured', () => {
    it('should return only featured and active trainings', async () => {
      await prisma.training.createMany({
        data: [
          {
            title: 'Featured Training 1',
            description: 'Description',
            category: TrainingCategory.INTRODUCTORY,
            level: TrainingLevel.BEGINNER,
            externalLink: 'https://example.com/1',
            duration: 60,
            price: 0,
            featured: true,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Regular Training',
            description: 'Description',
            category: TrainingCategory.INTRODUCTORY,
            level: TrainingLevel.BEGINNER,
            externalLink: 'https://example.com/2',
            duration: 60,
            price: 0,
            featured: false,
            isActive: true,
            displayOrder: 2,
          },
          {
            title: 'Featured Inactive',
            description: 'Description',
            category: TrainingCategory.INTRODUCTORY,
            level: TrainingLevel.BEGINNER,
            externalLink: 'https://example.com/3',
            duration: 60,
            price: 0,
            featured: true,
            isActive: false,
            displayOrder: 3,
          },
        ],
      });

      const response = await request(app)
        .get('/api/content/trainings/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].featured).toBe(true);
      expect(response.body.data[0].isActive).toBe(true);
    });
  });

  describe('GET /api/content/trainings/:id', () => {
    it('should return training by id', async () => {
      const training = await prisma.training.create({
        data: {
          title: 'Test Training',
          description: 'Test Description',
          category: TrainingCategory.INTRODUCTORY,
          level: TrainingLevel.BEGINNER,
          externalLink: 'https://example.com',
          duration: 60,
          price: 0,
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .get(`/api/content/trainings/${training.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(training.id);
      expect(response.body.data.title).toBe(training.title);
      expect(response.body.data.externalLink).toBe(training.externalLink);
    });

    it('should return 404 for non-existent training', async () => {
      const response = await request(app)
        .get('/api/content/trainings/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should return 404 for inactive training', async () => {
      const training = await prisma.training.create({
        data: {
          title: 'Inactive Training',
          description: 'Description',
          category: TrainingCategory.INTRODUCTORY,
          level: TrainingLevel.BEGINNER,
          externalLink: 'https://example.com',
          duration: 60,
          price: 0,
          isActive: false,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .get(`/api/content/trainings/${training.id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // Tools endpoints
  describe('GET /api/content/tools', () => {
    it('should return all active tools', async () => {
      await prisma.tool.createMany({
        data: [
          {
            title: 'Active Tool 1',
            description: 'Description 1',
            problemSolved: 'Problem 1',
            externalLink: 'https://example.com/1',
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Inactive Tool',
            description: 'Description',
            problemSolved: 'Problem',
            externalLink: 'https://example.com/2',
            isActive: false,
            displayOrder: 2,
          },
        ],
      });

      const response = await request(app)
        .get('/api/content/tools')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isActive).toBe(true);
    });
  });

  describe('GET /api/content/tools/:id', () => {
    it('should return tool by id', async () => {
      const tool = await prisma.tool.create({
        data: {
          title: 'Test Tool',
          description: 'Description',
          problemSolved: 'Problem',
          externalLink: 'https://example.com',
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .get(`/api/content/tools/${tool.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(tool.id);
    });
  });

  // Products endpoints
  describe('GET /api/content/products', () => {
    it('should return all active products', async () => {
      await prisma.product.createMany({
        data: [
          {
            title: 'Active Product',
            description: 'Description',
            problemSolved: 'Problem',
            status: ProductStatus.LIVE,
            externalLink: 'https://example.com/1',
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Inactive Product',
            description: 'Description',
            problemSolved: 'Problem',
            status: ProductStatus.LIVE,
            externalLink: 'https://example.com/2',
            isActive: false,
            displayOrder: 2,
          },
        ],
      });

      const response = await request(app)
        .get('/api/content/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/content/products/:id', () => {
    it('should return product by id', async () => {
      const product = await prisma.product.create({
        data: {
          title: 'Test Product',
          description: 'Description',
          problemSolved: 'Problem',
          status: ProductStatus.LIVE,
          externalLink: 'https://example.com',
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .get(`/api/content/products/${product.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(product.id);
    });
  });

  // Knowledge Articles endpoints
  describe('GET /api/content/knowledge', () => {
    it('should return all active knowledge articles', async () => {
      await prisma.knowledgeArticle.createMany({
        data: [
          {
            title: 'Active Article',
            description: 'Description',
            content: 'Content',
            category: KnowledgeCategory.CORE_CONCEPTS,
            readTime: 5,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Inactive Article',
            description: 'Description',
            content: 'Content',
            category: KnowledgeCategory.CORE_CONCEPTS,
            readTime: 5,
            isActive: false,
            displayOrder: 2,
          },
        ],
      });

      const response = await request(app)
        .get('/api/content/knowledge')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/content/knowledge/:id', () => {
    it('should return knowledge article by id', async () => {
      const article = await prisma.knowledgeArticle.create({
        data: {
          title: 'Test Article',
          description: 'Description',
          content: 'Content',
          category: KnowledgeCategory.CORE_CONCEPTS,
          readTime: 5,
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .get(`/api/content/knowledge/${article.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(article.id);
    });
  });

  describe('GET /api/content/knowledge/search?q=query', () => {
    it('should search knowledge articles', async () => {
      await prisma.knowledgeArticle.createMany({
        data: [
          {
            title: 'AI Fundamentals',
            description: 'Description',
            content: 'Content about AI',
            category: KnowledgeCategory.CORE_CONCEPTS,
            readTime: 5,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Machine Learning Basics',
            description: 'Description',
            content: 'Content about ML',
            category: KnowledgeCategory.CORE_CONCEPTS,
            readTime: 5,
            isActive: true,
            displayOrder: 2,
          },
        ],
      });

      const response = await request(app)
        .get('/api/content/knowledge/search?q=AI')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  // Community Links endpoints
  describe('GET /api/content/community', () => {
    it('should return all active community links', async () => {
      await prisma.communityLink.createMany({
        data: [
          {
            platform: CommunityPlatform.SKOOL,
            title: 'Skool Community',
            description: 'Description',
            externalLink: 'https://skool.com',
            isActive: true,
            displayOrder: 1,
          },
          {
            platform: CommunityPlatform.SLACK,
            title: 'Slack Community',
            description: 'Description',
            externalLink: 'https://slack.com',
            isActive: true,
            displayOrder: 2,
          },
          {
            platform: CommunityPlatform.SKOOL,
            title: 'Inactive Link',
            description: 'Description',
            externalLink: 'https://example.com',
            isActive: false,
            displayOrder: 3,
          },
        ],
      });

      const response = await request(app)
        .get('/api/content/community')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/content/community/:id', () => {
    it('should return community link by id', async () => {
      const link = await prisma.communityLink.create({
        data: {
          platform: CommunityPlatform.SKOOL,
          title: 'Test Community',
          description: 'Description',
          externalLink: 'https://example.com',
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .get(`/api/content/community/${link.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(link.id);
    });
  });
});


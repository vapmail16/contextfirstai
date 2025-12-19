/**
 * Admin Content Routes Tests
 * TDD Approach: Write tests first (RED phase)
 * 
 * Tests for admin content API endpoints (requires authentication + admin role)
 */

import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';
import { TrainingCategory, TrainingLevel, ProductStatus, KnowledgeCategory, CommunityPlatform } from '@prisma/client';
import { createTestUser, getAuthToken } from '../tests/setup';

describe('Admin Content API - Training Management', () => {
  let adminToken: string;
  let adminUser: any;
  let regularUserToken: string;
  let regularUser: any;

  beforeEach(async () => {
    // Create users in beforeEach (after global cleanup)
    // Create admin user
    adminUser = await createTestUser({
      email: `admin-${Date.now()}@test.com`,
      role: 'ADMIN' as any,
    });
    adminToken = await getAuthToken(adminUser.id);

    // Create regular user
    regularUser = await createTestUser({
      email: `user-${Date.now()}@test.com`,
      role: 'USER' as any,
    });
    regularUserToken = await getAuthToken(regularUser.id);

    // Clean all content
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
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/admin/trainings', () => {
    it('should create training as admin', async () => {
      const trainingData = {
        title: 'New Training',
        description: 'Training Description',
        category: TrainingCategory.INTRODUCTORY,
        level: TrainingLevel.BEGINNER,
        externalLink: 'https://example.com/training',
        duration: 60,
        price: 0,
        featured: false,
        isActive: true,
        displayOrder: 1,
      };

      const response = await request(app)
        .post('/api/admin/trainings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(trainingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(trainingData.title);
      expect(response.body.data.externalLink).toBe(trainingData.externalLink);
      expect(response.body.data.id).toBeDefined();
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/trainings')
        .send({
          title: 'Test',
          description: 'Test',
          category: TrainingCategory.INTRODUCTORY,
          level: TrainingLevel.BEGINNER,
          externalLink: 'https://example.com',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request from regular user (non-admin)', async () => {
      const response = await request(app)
        .post('/api/admin/trainings')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          title: 'Test',
          description: 'Test',
          category: TrainingCategory.INTRODUCTORY,
          level: TrainingLevel.BEGINNER,
          externalLink: 'https://example.com',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/admin/trainings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Missing fields',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/trainings/:id', () => {
    it('should update training as admin', async () => {
      const training = await prisma.training.create({
        data: {
          title: 'Original Title',
          description: 'Original Description',
          category: TrainingCategory.INTRODUCTORY,
          level: TrainingLevel.BEGINNER,
          externalLink: 'https://example.com/original',
          duration: 60,
          price: 0,
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .put(`/api/admin/trainings/${training.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          externalLink: 'https://example.com/updated',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.externalLink).toBe('https://example.com/updated');
    });

    it('should reject request from regular user', async () => {
      const training = await prisma.training.create({
        data: {
          title: 'Test Training',
          description: 'Description',
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
        .put(`/api/admin/trainings/${training.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ title: 'Updated' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent training', async () => {
      const response = await request(app)
        .put('/api/admin/trainings/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/admin/trainings/:id', () => {
    it('should soft delete training as admin', async () => {
      const training = await prisma.training.create({
        data: {
          title: 'To Delete',
          description: 'Description',
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
        .delete(`/api/admin/trainings/${training.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify soft delete
      const deleted = await prisma.training.findUnique({
        where: { id: training.id },
      });
      expect(deleted?.isActive).toBe(false);
    });

    it('should reject request from regular user', async () => {
      const training = await prisma.training.create({
        data: {
          title: 'Test Training',
          description: 'Description',
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
        .delete(`/api/admin/trainings/${training.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/trainings', () => {
    it('should get all trainings (including inactive) as admin', async () => {
      await prisma.training.createMany({
        data: [
          {
            title: 'Active Training',
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
            title: 'Inactive Training',
            description: 'Description',
            category: TrainingCategory.INTRODUCTORY,
            level: TrainingLevel.BEGINNER,
            externalLink: 'https://example.com/2',
            duration: 60,
            price: 0,
            isActive: false,
            displayOrder: 2,
          },
        ],
      });

      const response = await request(app)
        .get('/api/admin/trainings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should reject request from regular user', async () => {
      const response = await request(app)
        .get('/api/admin/trainings')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Admin Content API - Tool Management', () => {
  let adminToken: string;
  let adminUser: any;

  beforeEach(async () => {
    adminUser = await createTestUser({
      email: `admin-${Date.now()}@test.com`,
      role: 'ADMIN' as any,
    });
    adminToken = await getAuthToken(adminUser.id);
    await prisma.tool.deleteMany();
  });

  afterAll(async () => {
    await prisma.tool.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/admin/tools', () => {
    it('should create tool as admin', async () => {
      const toolData = {
        title: 'New Tool',
        description: 'Tool Description',
        problemSolved: 'Solves problem X',
        whoShouldUse: 'Developers',
        externalLink: 'https://example.com/tool',
        isActive: true,
        displayOrder: 1,
      };

      const response = await request(app)
        .post('/api/admin/tools')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(toolData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(toolData.title);
    });
  });

  describe('PUT /api/admin/tools/:id', () => {
    it('should update tool as admin', async () => {
      const tool = await prisma.tool.create({
        data: {
          title: 'Original Tool',
          description: 'Description',
          problemSolved: 'Problem',
          externalLink: 'https://example.com',
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .put(`/api/admin/tools/${tool.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Tool' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Tool');
    });
  });

  describe('DELETE /api/admin/tools/:id', () => {
    it('should soft delete tool as admin', async () => {
      const tool = await prisma.tool.create({
        data: {
          title: 'To Delete',
          description: 'Description',
          problemSolved: 'Problem',
          externalLink: 'https://example.com',
          isActive: true,
          displayOrder: 1,
        },
      });

      await request(app)
        .delete(`/api/admin/tools/${tool.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deleted = await prisma.tool.findUnique({ where: { id: tool.id } });
      expect(deleted?.isActive).toBe(false);
    });
  });
});

describe('Admin Content API - Product Management', () => {
  let adminToken: string;
  let adminUser: any;

  beforeEach(async () => {
    adminUser = await createTestUser({
      email: `admin-${Date.now()}@test.com`,
      role: 'ADMIN' as any,
    });
    adminToken = await getAuthToken(adminUser.id);
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/admin/products', () => {
    it('should create product as admin', async () => {
      const productData = {
        title: 'New Product',
        description: 'Product Description',
        problemSolved: 'Solves problem Y',
        status: ProductStatus.LIVE,
        externalLink: 'https://example.com/product',
        pricing: 'Free tier available',
        isActive: true,
        displayOrder: 1,
      };

      const response = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(productData.title);
      expect(response.body.data.status).toBe(ProductStatus.LIVE);
    });
  });

  describe('PUT /api/admin/products/:id', () => {
    it('should update product as admin', async () => {
      const product = await prisma.product.create({
        data: {
          title: 'Original Product',
          description: 'Description',
          problemSolved: 'Problem',
          status: ProductStatus.LIVE,
          externalLink: 'https://example.com',
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .put(`/api/admin/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: ProductStatus.BETA })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(ProductStatus.BETA);
    });
  });
});

describe('Admin Content API - Knowledge Article Management', () => {
  let adminToken: string;
  let adminUser: any;

  beforeEach(async () => {
    adminUser = await createTestUser({
      email: `admin-${Date.now()}@test.com`,
      role: 'ADMIN' as any,
    });
    adminToken = await getAuthToken(adminUser.id);
    await prisma.knowledgeArticle.deleteMany();
  });

  afterAll(async () => {
    await prisma.knowledgeArticle.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/admin/knowledge', () => {
    it('should create knowledge article as admin', async () => {
      const articleData = {
        title: 'New Article',
        description: 'Article Description',
        content: '# Content\n\nArticle content here',
        category: KnowledgeCategory.CORE_CONCEPTS,
        readTime: 10,
        isActive: true,
        displayOrder: 1,
      };

      const response = await request(app)
        .post('/api/admin/knowledge')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(articleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(articleData.title);
      expect(response.body.data.category).toBe(KnowledgeCategory.CORE_CONCEPTS);
    });
  });

  describe('PUT /api/admin/knowledge/:id', () => {
    it('should update knowledge article as admin', async () => {
      const article = await prisma.knowledgeArticle.create({
        data: {
          title: 'Original Article',
          description: 'Description',
          content: 'Content',
          category: KnowledgeCategory.CORE_CONCEPTS,
          readTime: 5,
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .put(`/api/admin/knowledge/${article.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Article' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Article');
    });
  });
});

describe('Admin Content API - Community Link Management', () => {
  let adminToken: string;
  let adminUser: any;

  beforeEach(async () => {
    adminUser = await createTestUser({
      email: `admin-${Date.now()}@test.com`,
      role: 'ADMIN' as any,
    });
    adminToken = await getAuthToken(adminUser.id);
    await prisma.communityLink.deleteMany();
  });

  afterAll(async () => {
    await prisma.communityLink.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/admin/community', () => {
    it('should create community link as admin', async () => {
      const linkData = {
        platform: CommunityPlatform.SKOOL,
        title: 'Skool Community',
        description: 'Join our community',
        externalLink: 'https://skool.com/community',
        isActive: true,
        displayOrder: 1,
      };

      const response = await request(app)
        .post('/api/admin/community')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(linkData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.platform).toBe(CommunityPlatform.SKOOL);
      expect(response.body.data.title).toBe(linkData.title);
    });
  });

  describe('PUT /api/admin/community/:id', () => {
    it('should update community link as admin', async () => {
      const link = await prisma.communityLink.create({
        data: {
          platform: CommunityPlatform.SKOOL,
          title: 'Original Link',
          externalLink: 'https://example.com',
          isActive: true,
          displayOrder: 1,
        },
      });

      const response = await request(app)
        .put(`/api/admin/community/${link.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Link' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Link');
    });
  });
});


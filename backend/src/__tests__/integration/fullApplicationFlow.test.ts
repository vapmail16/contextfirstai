/**
 * Full Application Flow Integration Tests
 * TDD Approach: Write tests that test COMPLETE user flows front-to-back
 * These tests catch issues where sub-functionalities fail in real usage
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/database';
import { hashPassword } from '../../services/authService';

describe('Full Application Flow - End-to-End Integration', () => {
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;

  beforeAll(async () => {
    // Clean up test data
    await prisma.contactSubmission.deleteMany();
    await prisma.newsletterSubscription.deleteMany();
    await prisma.training.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.product.deleteMany();
    await prisma.knowledgeArticle.deleteMany();
    await prisma.communityLink.deleteMany();
    await prisma.session.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up
    await prisma.contactSubmission.deleteMany();
    await prisma.newsletterSubscription.deleteMany();
    await prisma.training.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.product.deleteMany();
    await prisma.knowledgeArticle.deleteMany();
    await prisma.communityLink.deleteMany();
    await prisma.session.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    // Clean content before each test
    await prisma.training.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.product.deleteMany();
    await prisma.knowledgeArticle.deleteMany();
    await prisma.communityLink.deleteMany();
  });

  describe('Complete User Registration and Login Flow', () => {
    it('should complete full registration → login → access protected content flow', async () => {
      const userEmail = `test-user-${Date.now()}@example.com`;
      const userPassword = 'TestPassword123!';

      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: userEmail,
          password: userPassword,
          name: 'Test User',
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.email).toBe(userEmail);

      // Step 2: Login with registered credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: userEmail,
          password: userPassword,
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.accessToken).toBeDefined();
      const token = loginResponse.body.data.accessToken;

      // Step 3: Access protected endpoint (get current user)
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${token}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.data.email).toBe(userEmail);

      // Step 4: Access public content (should work without auth)
      const trainingsResponse = await request(app)
        .get('/api/content/trainings')
        .set('Origin', 'http://localhost:8080');

      expect(trainingsResponse.status).toBe(200);
      expect(trainingsResponse.body.success).toBe(true);
    });
  });

  describe('Complete Admin Content Management Flow', () => {
    beforeEach(async () => {
      // Create admin user for each test
      adminUser = await prisma.user.create({
        data: {
          email: `admin-${Date.now()}@example.com`,
          password: await hashPassword('AdminPassword123!'),
          name: 'Admin User',
          role: 'ADMIN',
        },
      });

      // Login as admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: adminUser.email,
          password: 'AdminPassword123!',
        });

      adminToken = loginResponse.body.data.accessToken;
    });

    it('should complete full admin flow: create → read → update → delete training', async () => {
      // Step 1: Create training
      const createResponse = await request(app)
        .post('/api/admin/trainings')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Training',
          description: 'Test Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com/training',
          duration: 60,
          price: 0,
          featured: false,
          isActive: true,
          displayOrder: 0,
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data.title).toBe('Test Training');
      const trainingId = createResponse.body.data.id;

      // Step 2: Read training (admin endpoint - list all, then find by id)
      const readResponse = await request(app)
        .get('/api/admin/trainings')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data).toBeInstanceOf(Array);
      const foundTraining = readResponse.body.data.find((t: any) => t.id === trainingId);
      expect(foundTraining).toBeDefined();
      expect(foundTraining.id).toBe(trainingId);

      // Step 3: Read training (public endpoint - should work)
      const publicReadResponse = await request(app)
        .get(`/api/content/trainings/${trainingId}`)
        .set('Origin', 'http://localhost:8080');

      expect(publicReadResponse.status).toBe(200);
      expect(publicReadResponse.body.data.id).toBe(trainingId);

      // Step 4: Update training
      const updateResponse = await request(app)
        .put(`/api/admin/trainings/${trainingId}`)
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Training',
          description: 'Updated Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com/training',
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.title).toBe('Updated Training');

      // Step 5: Verify update in public endpoint
      const verifyResponse = await request(app)
        .get(`/api/content/trainings/${trainingId}`)
        .set('Origin', 'http://localhost:8080');

      expect(verifyResponse.body.data.title).toBe('Updated Training');

      // Step 6: Delete training
      const deleteResponse = await request(app)
        .delete(`/api/admin/trainings/${trainingId}`)
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);

      // Step 7: Verify deletion (should return 404)
      const verifyDeleteResponse = await request(app)
        .get(`/api/content/trainings/${trainingId}`)
        .set('Origin', 'http://localhost:8080');

      expect(verifyDeleteResponse.status).toBe(404);
    });

    it('should complete full flow for all content types', async () => {
      // Test Tool CRUD
      const toolCreate = await request(app)
        .post('/api/admin/tools')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Tool',
          description: 'Tool Description',
          problemSolved: 'Solves problem',
          externalLink: 'https://example.com/tool',
          isActive: true,
        });

      expect(toolCreate.status).toBe(201);
      const toolId = toolCreate.body.data.id;

      // Verify tool in public endpoint
      const toolPublic = await request(app)
        .get(`/api/content/tools/${toolId}`)
        .set('Origin', 'http://localhost:8080');

      expect(toolPublic.status).toBe(200);

      // Test Product CRUD
      const productCreate = await request(app)
        .post('/api/admin/products')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Product',
          description: 'Product Description',
          problemSolved: 'Solves problem',
          status: 'LIVE',
          externalLink: 'https://example.com/product',
          isActive: true,
        });

      expect(productCreate.status).toBe(201);
      const productId = productCreate.body.data.id;

      // Verify product in public endpoint
      const productPublic = await request(app)
        .get(`/api/content/products/${productId}`)
        .set('Origin', 'http://localhost:8080');

      expect(productPublic.status).toBe(200);

      // Test Knowledge Article CRUD
      const articleCreate = await request(app)
        .post('/api/admin/knowledge')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Article',
          description: 'Article Description',
          content: '# Test Article\n\nContent here',
          category: 'GLOSSARY',
          isActive: true,
        });

      expect(articleCreate.status).toBe(201);
      const articleId = articleCreate.body.data.id;

      // Verify article in public endpoint
      const articlePublic = await request(app)
        .get(`/api/content/knowledge/${articleId}`)
        .set('Origin', 'http://localhost:8080');

      expect(articlePublic.status).toBe(200);

      // Test Community Link CRUD
      const linkCreate = await request(app)
        .post('/api/admin/community')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Community',
          platform: 'SKOOL',
          externalLink: 'https://example.com/community',
          isActive: true,
        });

      expect(linkCreate.status).toBe(201);
      const linkId = linkCreate.body.data.id;

      // Verify link in public endpoint
      const linkPublic = await request(app)
        .get(`/api/content/community/${linkId}`)
        .set('Origin', 'http://localhost:8080');

      expect(linkPublic.status).toBe(200);
    });
  });

  describe('Complete Contact Form Flow', () => {
    it('should complete contact form submission flow', async () => {
      // Step 1: Submit contact form
      const submitResponse = await request(app)
        .post('/api/contact')
        .set('Origin', 'http://localhost:8080')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Inquiry',
          message: 'This is a test message',
        });

      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.success).toBe(true);
      expect(submitResponse.body.data.email).toBe('test@example.com');

      // Step 2: Verify submission was saved (would need admin endpoint to verify)
      // For now, we just verify the response
      const submissionId = submitResponse.body.data.id;
      expect(submissionId).toBeDefined();
    });
  });

  describe('Complete Newsletter Subscription Flow', () => {
    it('should complete newsletter subscription flow', async () => {
      const email = `newsletter-${Date.now()}@example.com`;

      // Step 1: Subscribe
      const subscribeResponse = await request(app)
        .post('/api/newsletter/subscribe')
        .set('Origin', 'http://localhost:8080')
        .send({
          email,
          source: 'Home Page',
        });

      expect(subscribeResponse.status).toBe(201);
      expect(subscribeResponse.body.success).toBe(true);
      expect(subscribeResponse.body.data.email).toBe(email);
      expect(subscribeResponse.body.data.isActive).toBe(true);

      // Step 2: Try to subscribe again (should fail)
      const duplicateResponse = await request(app)
        .post('/api/newsletter/subscribe')
        .set('Origin', 'http://localhost:8080')
        .send({
          email,
        });

      expect(duplicateResponse.status).toBe(400); // ValidationError (email already subscribed)

      // Step 3: Unsubscribe
      const unsubscribeResponse = await request(app)
        .post('/api/newsletter/unsubscribe')
        .set('Origin', 'http://localhost:8080')
        .send({
          email,
        });

      expect(unsubscribeResponse.status).toBe(200);
      expect(unsubscribeResponse.body.success).toBe(true);
      if (unsubscribeResponse.body.data) {
        expect(unsubscribeResponse.body.data.isActive).toBe(false);
      }
    });
  });

  describe('Complete Content Listing and Filtering Flow', () => {
    beforeEach(async () => {
      // Create admin and login
      adminUser = await prisma.user.create({
        data: {
          email: `admin-${Date.now()}@example.com`,
          password: await hashPassword('AdminPassword123!'),
          name: 'Admin User',
          role: 'ADMIN',
        },
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: adminUser.email,
          password: 'AdminPassword123!',
        });

      adminToken = loginResponse.body.data.accessToken;

      // Create test content
      await request(app)
        .post('/api/admin/trainings')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Featured Training',
          description: 'Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com',
          featured: true,
          isActive: true,
        });

      await request(app)
        .post('/api/admin/trainings')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Regular Training',
          description: 'Description',
          category: 'TOOL_BASED',
          level: 'INTERMEDIATE',
          externalLink: 'https://example.com',
          featured: false,
          isActive: true,
        });
    });

    it('should complete content listing and filtering flow', async () => {
      // Step 1: Get all trainings
      const allResponse = await request(app)
        .get('/api/content/trainings')
        .set('Origin', 'http://localhost:8080');

      expect(allResponse.status).toBe(200);
      expect(allResponse.body.data.length).toBeGreaterThanOrEqual(2);

      // Step 2: Get featured trainings
      const featuredResponse = await request(app)
        .get('/api/content/trainings/featured')
        .set('Origin', 'http://localhost:8080');

      expect(featuredResponse.status).toBe(200);
      expect(featuredResponse.body.data.length).toBeGreaterThanOrEqual(1);
      expect(featuredResponse.body.data[0].featured).toBe(true);

      // Step 3: Search knowledge articles
      const searchResponse = await request(app)
        .get('/api/content/knowledge/search?q=test')
        .set('Origin', 'http://localhost:8080');

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.success).toBe(true);
    });
  });

  describe('Complete Authentication and Authorization Flow', () => {
    beforeEach(async () => {
      // Create regular user
      regularUser = await prisma.user.create({
        data: {
          email: `user-${Date.now()}@example.com`,
          password: await hashPassword('UserPassword123!'),
          name: 'Regular User',
          role: 'USER',
        },
      });

      const userLoginResponse = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: regularUser.email,
          password: 'UserPassword123!',
        });

      userToken = userLoginResponse.body.data.accessToken;

      // Create admin
      adminUser = await prisma.user.create({
        data: {
          email: `admin-${Date.now()}@example.com`,
          password: await hashPassword('AdminPassword123!'),
          name: 'Admin User',
          role: 'ADMIN',
        },
      });

      const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: adminUser.email,
          password: 'AdminPassword123!',
        });

      adminToken = adminLoginResponse.body.data.accessToken;
    });

    it('should enforce authorization: regular user cannot access admin endpoints', async () => {
      // Regular user tries to access admin endpoint
      const response = await request(app)
        .get('/api/admin/trainings')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403); // Forbidden
    });

    it('should allow admin to access admin endpoints', async () => {
      // Admin accesses admin endpoint
      const response = await request(app)
        .get('/api/admin/trainings')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow public access to public endpoints without auth', async () => {
      // No auth required for public endpoints
      const response = await request(app)
        .get('/api/content/trainings')
        .set('Origin', 'http://localhost:8080');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Complete Token Refresh Flow', () => {
    it('should complete token refresh flow', async () => {
      // Create user and login
      const user = await prisma.user.create({
        data: {
          email: `refresh-${Date.now()}@example.com`,
          password: await hashPassword('Password123!'),
          name: 'Test User',
          role: 'USER',
        },
      });

      // Login to get tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: user.email,
          password: 'Password123!',
        });

      const setCookieHeader = loginResponse.headers['set-cookie'];
      const cookieArray = Array.isArray(setCookieHeader) ? setCookieHeader : (setCookieHeader ? [setCookieHeader] : []);
      const refreshTokenCookie = cookieArray.find((cookie: string) => cookie.includes('refreshToken'));

      expect(refreshTokenCookie).toBeDefined();

      // Extract refresh token from cookie
      const refreshToken = refreshTokenCookie?.split(';')[0].split('=')[1];

      // Use refresh token to get new access token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .set('Origin', 'http://localhost:8080')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.data.accessToken).toBeDefined();

      // Use new access token
      const newAccessToken = refreshResponse.body.data.accessToken;
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${newAccessToken}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.data.email).toBe(user.email);
    });
  });

  describe('Complete Logout Flow', () => {
    it('should complete logout flow and invalidate tokens', async () => {
      // Create user and login
      const user = await prisma.user.create({
        data: {
          email: `logout-${Date.now()}@example.com`,
          password: await hashPassword('Password123!'),
          name: 'Test User',
          role: 'USER',
        },
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: user.email,
          password: 'Password123!',
        });

      const accessToken = loginResponse.body.data.accessToken;
      const setCookieHeader = loginResponse.headers['set-cookie'];
      const cookieArray = Array.isArray(setCookieHeader) ? setCookieHeader : (setCookieHeader ? [setCookieHeader] : []);
      const refreshTokenCookie = cookieArray.find((cookie: string) => cookie.includes('refreshToken'));
      const refreshToken = refreshTokenCookie?.split(';')[0].split('=')[1];

      // Verify token works
      const meBeforeLogout = await request(app)
        .get('/api/auth/me')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(meBeforeLogout.status).toBe(200);

      // Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(logoutResponse.status).toBe(200);

      // Verify token no longer works (session deleted)
      // Note: Access token might still work until expiry, but refresh should be invalid
      const refreshAfterLogout = await request(app)
        .post('/api/auth/refresh')
        .set('Origin', 'http://localhost:8080')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(refreshAfterLogout.status).toBe(401);
    });
  });
});


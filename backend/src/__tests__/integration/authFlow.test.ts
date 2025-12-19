/**
 * Authentication Flow Integration Tests
 * TDD Approach: Write tests that test REAL API endpoints with CORS
 * These tests should catch issues that unit tests miss
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/database';
import { hashPassword } from '../../services/authService';

describe('Authentication Flow - Real API Integration', () => {
  let testUser: { email: string; password: string; name: string };

  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test-integration@',
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test-integration@',
        },
      },
    });
  });

  beforeEach(() => {
    testUser = {
      email: `test-integration-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User',
    };
  });

  describe('CORS Configuration', () => {
    it('should allow requests from frontend origin with credentials', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type, Authorization');

      expect(response.status).toBe(204); // OPTIONS should return 204
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should include CORS headers in actual requests', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Origin', 'http://localhost:8080')
        .set('Content-Type', 'application/json')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should reject duplicate email registration', async () => {
      // Register first time
      await request(app)
        .post('/api/auth/register')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      // Try to register again
      const response = await request(app)
        .post('/api/auth/register')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      expect(response.status).toBe(409); // Conflict - email already exists
    });
  });

  describe('Login Flow', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await prisma.user.create({
        data: {
          email: testUser.email,
          password: await hashPassword(testUser.password),
          name: testUser.name,
          role: 'USER',
        },
      });
    });

    it('should login successfully and return access token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .set('Content-Type', 'application/json')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);

      // Check for refresh token cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      expect(cookieArray.some((cookie: string) => cookie.includes('refreshToken'))).toBe(true);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should allow authenticated requests with access token', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .set('Origin', 'http://localhost:8080')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const accessToken = loginResponse.body.data.accessToken;

      // Use token to access protected endpoint
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.success).toBe(true);
      expect(meResponse.body.data.email).toBe(testUser.email);
    });
  });

  describe('Protected Routes', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create admin user
      const adminUser = await prisma.user.create({
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

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should allow admin to access admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/trainings')
        .set('Origin', 'http://localhost:8080')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/trainings')
        .set('Origin', 'http://localhost:8080');

      expect(response.status).toBe(401);
    });
  });
});


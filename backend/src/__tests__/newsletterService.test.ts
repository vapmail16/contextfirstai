/**
 * Newsletter Service Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { prisma } from '../config/database';
import { NewsletterService } from '../services/newsletterService';
import { ValidationError } from '../utils/errors';

describe('NewsletterService', () => {
  beforeEach(async () => {
    await prisma.newsletterSubscription.deleteMany();
  });

  afterAll(async () => {
    await prisma.newsletterSubscription.deleteMany();
    await prisma.$disconnect();
  });

  describe('subscribe', () => {
    it('should create newsletter subscription', async () => {
      const email = 'test@example.com';

      const subscription = await NewsletterService.subscribe(email);

      expect(subscription).toBeDefined();
      expect(subscription.id).toBeDefined();
      expect(subscription.email).toBe(email);
      expect(subscription.isActive).toBe(true);
    });

    it('should throw ValidationError for invalid email', async () => {
      await expect(
        NewsletterService.subscribe('invalid-email')
      ).rejects.toThrow(ValidationError);
    });
  });
});


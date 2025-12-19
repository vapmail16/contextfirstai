/**
 * Newsletter Service Email Integration Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { NewsletterService } from '../services/newsletterService';
import * as emailService from '../services/emailService';
import { prisma } from '../config/database';

// Mock email service
jest.mock('../services/emailService', () => ({
  sendNewsletterConfirmationEmail: jest.fn(),
}));

describe('NewsletterService - Email Integration', () => {
  beforeEach(async () => {
    await prisma.newsletterSubscription.deleteMany();
    jest.clearAllMocks();
  });

  it('should send confirmation email when user subscribes', async () => {
    const email = 'new@example.com';

    const subscription = await NewsletterService.subscribe(email);

    expect(subscription).toBeDefined();
    expect(emailService.sendNewsletterConfirmationEmail).toHaveBeenCalledWith({
      email,
    });
  });

  it('should send email when reactivating existing subscription', async () => {
    const email = 'existing@example.com';
    
    // Create inactive subscription
    await prisma.newsletterSubscription.create({
      data: { email, isActive: false },
    });

    const subscription = await NewsletterService.subscribe(email);

    expect(subscription.isActive).toBe(true);
    // Should still send confirmation on reactivation
    expect(emailService.sendNewsletterConfirmationEmail).toHaveBeenCalled();
  });
});


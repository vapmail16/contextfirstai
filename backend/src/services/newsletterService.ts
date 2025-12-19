/**
 * Newsletter Service
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { prisma } from '../config/database';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import * as emailService from './emailService';

export class NewsletterService {
  static async subscribe(email: string) {
    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ValidationError('Email is already subscribed');
      }
      // Reactivate if previously unsubscribed
      const subscription = await prisma.newsletterSubscription.update({
        where: { email },
        data: { isActive: true, unsubscribedAt: null },
      });
      logger.info('Newsletter subscription reactivated', { email });

      // Send confirmation email on reactivation
      try {
        await emailService.sendNewsletterConfirmationEmail({ email });
      } catch (error: any) {
        logger.error('Failed to send newsletter confirmation email', {
          email,
          error: error.message,
        });
      }

      return subscription;
    }

    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email,
        isActive: true,
      },
    });

    logger.info('Newsletter subscription created', { email });

    // Send confirmation email
    try {
      await emailService.sendNewsletterConfirmationEmail({ email });
    } catch (error: any) {
      // Log error but don't fail the subscription
      logger.error('Failed to send newsletter confirmation email', {
        email,
        error: error.message,
      });
    }

    return subscription;
  }

  static async unsubscribe(email: string) {
    if (!email) {
      throw new ValidationError('Email is required');
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (!subscription) {
      throw new ValidationError('Email not found in subscriptions');
    }

    const updated = await prisma.newsletterSubscription.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    logger.info('Newsletter subscription deactivated', { email });
    return updated;
  }
}


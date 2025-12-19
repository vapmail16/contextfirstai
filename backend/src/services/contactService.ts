/**
 * Contact Service
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { prisma } from '../config/database';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import * as emailService from './emailService';

export class ContactService {
  static async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    if (!data.name || !data.email || !data.subject || !data.message) {
      throw new ValidationError('All fields are required: name, email, subject, message');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: 'PENDING',
      },
    });

    logger.info('Contact submission created', { submissionId: submission.id });

    // Send email notification to admin
    try {
      await emailService.sendContactNotificationEmail({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });
    } catch (error: any) {
      // Log error but don't fail the submission
      logger.error('Failed to send contact notification email', {
        submissionId: submission.id,
        error: error.message,
      });
    }

    return submission;
  }
}


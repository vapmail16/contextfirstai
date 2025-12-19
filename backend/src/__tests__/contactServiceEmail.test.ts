/**
 * Contact Service Email Integration Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ContactService } from '../services/contactService';
import * as emailService from '../services/emailService';
import { prisma } from '../config/database';

// Mock email service
jest.mock('../services/emailService', () => ({
  sendContactNotificationEmail: jest.fn(),
}));

describe('ContactService - Email Integration', () => {
  beforeEach(async () => {
    await prisma.contactSubmission.deleteMany();
    jest.clearAllMocks();
  });

  it('should send email notification when contact form is submitted', async () => {
    const submissionData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Inquiry',
      message: 'This is a test message',
    };

    const submission = await ContactService.submitContactForm(submissionData);

    expect(submission).toBeDefined();
    expect(emailService.sendContactNotificationEmail).toHaveBeenCalledWith({
      name: submissionData.name,
      email: submissionData.email,
      subject: submissionData.subject,
      message: submissionData.message,
    });
  });
});


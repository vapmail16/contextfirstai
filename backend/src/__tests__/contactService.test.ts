/**
 * Contact Service Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { prisma } from '../config/database';
import { ContactService } from '../services/contactService';
import { ValidationError } from '../utils/errors';

describe('ContactService', () => {
  beforeEach(async () => {
    await prisma.contactSubmission.deleteMany();
  });

  afterAll(async () => {
    await prisma.contactSubmission.deleteMany();
    await prisma.$disconnect();
  });

  describe('submitContactForm', () => {
    it('should create contact submission', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      };

      const submission = await ContactService.submitContactForm(data);

      expect(submission).toBeDefined();
      expect(submission.id).toBeDefined();
      expect(submission.name).toBe(data.name);
      expect(submission.email).toBe(data.email);
    });

    it('should throw ValidationError for missing required fields', async () => {
      await expect(
        ContactService.submitContactForm({} as any)
      ).rejects.toThrow(ValidationError);
    });
  });
});


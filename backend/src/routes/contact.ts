/**
 * Contact Routes
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { ContactService } from '../services/contactService';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * POST /api/contact
 * Submit contact form
 */
router.post(
  '/',
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ]),
  asyncHandler(async (req, res) => {
    const submission = await ContactService.submitContactForm(req.body);

    return res.status(201).json({
      success: true,
      data: submission,
      message: 'Contact form submitted successfully',
    });
  })
);

export default router;


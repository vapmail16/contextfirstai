/**
 * Newsletter Routes
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { NewsletterService } from '../services/newsletterService';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
router.post(
  '/subscribe',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  asyncHandler(async (req, res) => {
    const subscription = await NewsletterService.subscribe(req.body.email);

    return res.status(201).json({
      success: true,
      data: subscription,
      message: 'Successfully subscribed to newsletter',
    });
  })
);

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe from newsletter
 */
router.post(
  '/unsubscribe',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  asyncHandler(async (req, res) => {
    await NewsletterService.unsubscribe(req.body.email);

    return res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  })
);

export default router;


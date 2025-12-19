/**
 * Admin Content Routes
 * TDD Approach: This file will be implemented to make tests pass (GREEN phase)
 * 
 * Admin endpoints for content management (requires authentication + admin role)
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { ContentService } from '../services/contentService';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { TrainingCategory, TrainingLevel, ProductStatus, KnowledgeCategory, CommunityPlatform } from '@prisma/client';
import { prisma } from '../config/database';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('ADMIN', 'SUPER_ADMIN'));

/**
 * GET /api/admin/trainings
 * Get all trainings (including inactive) - admin only
 */
router.get(
  '/trainings',
  asyncHandler(async (_req, res) => {
    // TODO: Implement getAllTrainings method in ContentService
    const trainings = await prisma.training.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({
      success: true,
      data: trainings,
    });
  })
);

/**
 * POST /api/admin/trainings
 * Create new training - admin only
 */
router.post(
  '/trainings',
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(Object.values(TrainingCategory)).withMessage('Invalid category'),
    body('level').isIn(Object.values(TrainingLevel)).withMessage('Invalid level'),
    body('externalLink').isURL().withMessage('External link must be a valid URL'),
    body('duration').optional().isInt({ min: 0 }),
    body('price').optional().isFloat({ min: 0 }),
    body('featured').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const training = await ContentService.createTraining(req.body);

    return res.status(201).json({
      success: true,
      data: training,
    });
  })
);

/**
 * PUT /api/admin/trainings/:id
 * Update training - admin only
 */
router.put(
  '/trainings/:id',
  validate([
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('category').optional().isIn(Object.values(TrainingCategory)),
    body('level').optional().isIn(Object.values(TrainingLevel)),
    body('externalLink').optional().isURL(),
    body('duration').optional().isInt({ min: 0 }),
    body('price').optional().isFloat({ min: 0 }),
    body('featured').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const training = await ContentService.updateTraining(id, req.body);

    return res.json({
      success: true,
      data: training,
    });
  })
);

/**
 * DELETE /api/admin/trainings/:id
 * Delete training (soft delete) - admin only
 */
router.delete(
  '/trainings/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await ContentService.deleteTraining(id);

    return res.json({
      success: true,
      message: 'Training deleted successfully',
    });
  })
);

// ===== TOOLS =====

/**
 * GET /api/admin/tools
 * Get all tools (including inactive) - admin only
 */
router.get(
  '/tools',
  asyncHandler(async (_req, res) => {
    const tools = await prisma.tool.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({
      success: true,
      data: tools,
    });
  })
);

/**
 * POST /api/admin/tools
 * Create new tool - admin only
 */
router.post(
  '/tools',
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('problemSolved').notEmpty().withMessage('Problem solved is required'),
    body('externalLink').isURL().withMessage('External link must be a valid URL'),
    body('whoShouldUse').optional().isString(),
    body('relatedTrainingIds').optional().isArray(),
    body('featured').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const tool = await ContentService.createTool(req.body);

    return res.status(201).json({
      success: true,
      data: tool,
    });
  })
);

/**
 * PUT /api/admin/tools/:id
 * Update tool - admin only
 */
router.put(
  '/tools/:id',
  validate([
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('problemSolved').optional().notEmpty(),
    body('externalLink').optional().isURL(),
    body('whoShouldUse').optional().isString(),
    body('relatedTrainingIds').optional().isArray(),
    body('featured').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tool = await ContentService.updateTool(id, req.body);

    return res.json({
      success: true,
      data: tool,
    });
  })
);

/**
 * DELETE /api/admin/tools/:id
 * Delete tool (soft delete) - admin only
 */
router.delete(
  '/tools/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await ContentService.deleteTool(id);

    return res.json({
      success: true,
      message: 'Tool deleted successfully',
    });
  })
);

// ===== PRODUCTS =====

/**
 * GET /api/admin/products
 * Get all products (including inactive) - admin only
 */
router.get(
  '/products',
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({
      success: true,
      data: products,
    });
  })
);

/**
 * POST /api/admin/products
 * Create new product - admin only
 */
router.post(
  '/products',
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('problemSolved').notEmpty().withMessage('Problem solved is required'),
    body('status').isIn(Object.values(ProductStatus)).withMessage('Invalid product status'),
    body('externalLink').isURL().withMessage('External link must be a valid URL'),
    body('pricing').optional().isString(),
    body('featured').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const product = await ContentService.createProduct(req.body);

    return res.status(201).json({
      success: true,
      data: product,
    });
  })
);

/**
 * PUT /api/admin/products/:id
 * Update product - admin only
 */
router.put(
  '/products/:id',
  validate([
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('problemSolved').optional().notEmpty(),
    body('status').optional().isIn(Object.values(ProductStatus)),
    body('externalLink').optional().isURL(),
    body('pricing').optional().isString(),
    body('featured').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await ContentService.updateProduct(id, req.body);

    return res.json({
      success: true,
      data: product,
    });
  })
);

/**
 * DELETE /api/admin/products/:id
 * Delete product (soft delete) - admin only
 */
router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await ContentService.deleteProduct(id);

    return res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  })
);

// ===== KNOWLEDGE ARTICLES =====

/**
 * GET /api/admin/knowledge
 * Get all knowledge articles (including inactive) - admin only
 */
router.get(
  '/knowledge',
  asyncHandler(async (_req, res) => {
    const articles = await prisma.knowledgeArticle.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({
      success: true,
      data: articles,
    });
  })
);

/**
 * POST /api/admin/knowledge
 * Create new knowledge article - admin only
 */
router.post(
  '/knowledge',
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').isIn(Object.values(KnowledgeCategory)).withMessage('Invalid knowledge category'),
    body('readTime').optional().isInt({ min: 0 }),
    body('externalLink').optional().isURL(),
    body('featured').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const article = await ContentService.createKnowledgeArticle(req.body);

    return res.status(201).json({
      success: true,
      data: article,
    });
  })
);

/**
 * PUT /api/admin/knowledge/:id
 * Update knowledge article - admin only
 */
router.put(
  '/knowledge/:id',
  validate([
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('content').optional().notEmpty(),
    body('category').optional().isIn(Object.values(KnowledgeCategory)),
    body('readTime').optional().isInt({ min: 0 }),
    body('externalLink').optional().isURL(),
    body('featured').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await ContentService.updateKnowledgeArticle(id, req.body);

    return res.json({
      success: true,
      data: article,
    });
  })
);

/**
 * DELETE /api/admin/knowledge/:id
 * Delete knowledge article (soft delete) - admin only
 */
router.delete(
  '/knowledge/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await ContentService.deleteKnowledgeArticle(id);

    return res.json({
      success: true,
      message: 'Knowledge article deleted successfully',
    });
  })
);

// ===== COMMUNITY LINKS =====

/**
 * GET /api/admin/community
 * Get all community links (including inactive) - admin only
 */
router.get(
  '/community',
  asyncHandler(async (_req, res) => {
    const links = await prisma.communityLink.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({
      success: true,
      data: links,
    });
  })
);

/**
 * POST /api/admin/community
 * Create new community link - admin only
 */
router.post(
  '/community',
  validate([
    body('platform').isIn(Object.values(CommunityPlatform)).withMessage('Invalid community platform'),
    body('title').notEmpty().withMessage('Title is required'),
    body('externalLink').isURL().withMessage('External link must be a valid URL'),
    body('description').optional().isString(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const link = await ContentService.createCommunityLink(req.body);

    return res.status(201).json({
      success: true,
      data: link,
    });
  })
);

/**
 * PUT /api/admin/community/:id
 * Update community link - admin only
 */
router.put(
  '/community/:id',
  validate([
    body('platform').optional().isIn(Object.values(CommunityPlatform)),
    body('title').optional().notEmpty(),
    body('externalLink').optional().isURL(),
    body('description').optional().isString(),
    body('isActive').optional().isBoolean(),
    body('displayOrder').optional().isInt({ min: 0 }),
  ]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const link = await ContentService.updateCommunityLink(id, req.body);

    return res.json({
      success: true,
      data: link,
    });
  })
);

/**
 * DELETE /api/admin/community/:id
 * Delete community link (soft delete) - admin only
 */
router.delete(
  '/community/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await ContentService.deleteCommunityLink(id);

    return res.json({
      success: true,
      message: 'Community link deleted successfully',
    });
  })
);

export default router;


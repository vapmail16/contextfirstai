"use strict";
/**
 * Admin Content Routes
 * TDD Approach: This file will be implemented to make tests pass (GREEN phase)
 *
 * Admin endpoints for content management (requires authentication + admin role)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const contentService_1 = require("../services/contentService");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const asyncHandler_1 = require("../utils/asyncHandler");
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use((0, auth_1.requireRole)('ADMIN', 'SUPER_ADMIN'));
/**
 * GET /api/admin/trainings
 * Get all trainings (including inactive) - admin only
 */
router.get('/trainings', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    // TODO: Implement getAllTrainings method in ContentService
    const trainings = await database_1.prisma.training.findMany({
        orderBy: { displayOrder: 'asc' },
    });
    return res.json({
        success: true,
        data: trainings,
    });
}));
/**
 * POST /api/admin/trainings
 * Create new training - admin only
 */
router.post('/trainings', (0, validation_1.validate)([
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('category').isIn(Object.values(client_1.TrainingCategory)).withMessage('Invalid category'),
    (0, express_validator_1.body)('level').isIn(Object.values(client_1.TrainingLevel)).withMessage('Invalid level'),
    (0, express_validator_1.body)('externalLink').isURL().withMessage('External link must be a valid URL'),
    (0, express_validator_1.body)('duration').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('featured').optional().isBoolean(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const training = await contentService_1.ContentService.createTraining(req.body);
    return res.status(201).json({
        success: true,
        data: training,
    });
}));
/**
 * PUT /api/admin/trainings/:id
 * Update training - admin only
 */
router.put('/trainings/:id', (0, validation_1.validate)([
    (0, express_validator_1.body)('title').optional().notEmpty(),
    (0, express_validator_1.body)('description').optional().notEmpty(),
    (0, express_validator_1.body)('category').optional().isIn(Object.values(client_1.TrainingCategory)),
    (0, express_validator_1.body)('level').optional().isIn(Object.values(client_1.TrainingLevel)),
    (0, express_validator_1.body)('externalLink').optional().isURL(),
    (0, express_validator_1.body)('duration').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('featured').optional().isBoolean(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const training = await contentService_1.ContentService.updateTraining(id, req.body);
    return res.json({
        success: true,
        data: training,
    });
}));
/**
 * DELETE /api/admin/trainings/:id
 * Delete training (soft delete) - admin only
 */
router.delete('/trainings/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await contentService_1.ContentService.deleteTraining(id);
    return res.json({
        success: true,
        message: 'Training deleted successfully',
    });
}));
// ===== TOOLS =====
/**
 * GET /api/admin/tools
 * Get all tools (including inactive) - admin only
 */
router.get('/tools', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const tools = await database_1.prisma.tool.findMany({
        orderBy: { displayOrder: 'asc' },
    });
    return res.json({
        success: true,
        data: tools,
    });
}));
/**
 * POST /api/admin/tools
 * Create new tool - admin only
 */
router.post('/tools', (0, validation_1.validate)([
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('problemSolved').notEmpty().withMessage('Problem solved is required'),
    (0, express_validator_1.body)('externalLink').isURL().withMessage('External link must be a valid URL'),
    (0, express_validator_1.body)('whoShouldUse').optional().isString(),
    (0, express_validator_1.body)('relatedTrainingIds').optional().isArray(),
    (0, express_validator_1.body)('featured').optional().isBoolean(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const tool = await contentService_1.ContentService.createTool(req.body);
    return res.status(201).json({
        success: true,
        data: tool,
    });
}));
/**
 * PUT /api/admin/tools/:id
 * Update tool - admin only
 */
router.put('/tools/:id', (0, validation_1.validate)([
    (0, express_validator_1.body)('title').optional().notEmpty(),
    (0, express_validator_1.body)('description').optional().notEmpty(),
    (0, express_validator_1.body)('problemSolved').optional().notEmpty(),
    (0, express_validator_1.body)('externalLink').optional().isURL(),
    (0, express_validator_1.body)('whoShouldUse').optional().isString(),
    (0, express_validator_1.body)('relatedTrainingIds').optional().isArray(),
    (0, express_validator_1.body)('featured').optional().isBoolean(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const tool = await contentService_1.ContentService.updateTool(id, req.body);
    return res.json({
        success: true,
        data: tool,
    });
}));
/**
 * DELETE /api/admin/tools/:id
 * Delete tool (soft delete) - admin only
 */
router.delete('/tools/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await contentService_1.ContentService.deleteTool(id);
    return res.json({
        success: true,
        message: 'Tool deleted successfully',
    });
}));
// ===== PRODUCTS =====
/**
 * GET /api/admin/products
 * Get all products (including inactive) - admin only
 */
router.get('/products', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const products = await database_1.prisma.product.findMany({
        orderBy: { displayOrder: 'asc' },
    });
    return res.json({
        success: true,
        data: products,
    });
}));
/**
 * POST /api/admin/products
 * Create new product - admin only
 */
router.post('/products', (0, validation_1.validate)([
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('problemSolved').notEmpty().withMessage('Problem solved is required'),
    (0, express_validator_1.body)('status').isIn(Object.values(client_1.ProductStatus)).withMessage('Invalid product status'),
    (0, express_validator_1.body)('externalLink').isURL().withMessage('External link must be a valid URL'),
    (0, express_validator_1.body)('pricing').optional().isString(),
    (0, express_validator_1.body)('featured').optional().isBoolean(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await contentService_1.ContentService.createProduct(req.body);
    return res.status(201).json({
        success: true,
        data: product,
    });
}));
/**
 * PUT /api/admin/products/:id
 * Update product - admin only
 */
router.put('/products/:id', (0, validation_1.validate)([
    (0, express_validator_1.body)('title').optional().notEmpty(),
    (0, express_validator_1.body)('description').optional().notEmpty(),
    (0, express_validator_1.body)('problemSolved').optional().notEmpty(),
    (0, express_validator_1.body)('status').optional().isIn(Object.values(client_1.ProductStatus)),
    (0, express_validator_1.body)('externalLink').optional().isURL(),
    (0, express_validator_1.body)('pricing').optional().isString(),
    (0, express_validator_1.body)('featured').optional().isBoolean(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const product = await contentService_1.ContentService.updateProduct(id, req.body);
    return res.json({
        success: true,
        data: product,
    });
}));
/**
 * DELETE /api/admin/products/:id
 * Delete product (soft delete) - admin only
 */
router.delete('/products/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await contentService_1.ContentService.deleteProduct(id);
    return res.json({
        success: true,
        message: 'Product deleted successfully',
    });
}));
// ===== KNOWLEDGE ARTICLES =====
/**
 * GET /api/admin/knowledge
 * Get all knowledge articles (including inactive) - admin only
 */
router.get('/knowledge', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const articles = await database_1.prisma.knowledgeArticle.findMany({
        orderBy: { displayOrder: 'asc' },
    });
    return res.json({
        success: true,
        data: articles,
    });
}));
/**
 * POST /api/admin/knowledge
 * Create new knowledge article - admin only
 */
router.post('/knowledge', (0, validation_1.validate)([
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('category').isIn(Object.values(client_1.KnowledgeCategory)).withMessage('Invalid knowledge category'),
    (0, express_validator_1.body)('readTime').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('externalLink').optional().isURL(),
    (0, express_validator_1.body)('featured').optional().isBoolean(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const article = await contentService_1.ContentService.createKnowledgeArticle(req.body);
    return res.status(201).json({
        success: true,
        data: article,
    });
}));
/**
 * PUT /api/admin/knowledge/:id
 * Update knowledge article - admin only
 */
router.put('/knowledge/:id', (0, validation_1.validate)([
    (0, express_validator_1.body)('title').optional().notEmpty(),
    (0, express_validator_1.body)('description').optional().notEmpty(),
    (0, express_validator_1.body)('content').optional().notEmpty(),
    (0, express_validator_1.body)('category').optional().isIn(Object.values(client_1.KnowledgeCategory)),
    (0, express_validator_1.body)('readTime').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('externalLink').optional().isURL(),
    (0, express_validator_1.body)('featured').optional().isBoolean(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const article = await contentService_1.ContentService.updateKnowledgeArticle(id, req.body);
    return res.json({
        success: true,
        data: article,
    });
}));
/**
 * DELETE /api/admin/knowledge/:id
 * Delete knowledge article (soft delete) - admin only
 */
router.delete('/knowledge/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await contentService_1.ContentService.deleteKnowledgeArticle(id);
    return res.json({
        success: true,
        message: 'Knowledge article deleted successfully',
    });
}));
// ===== COMMUNITY LINKS =====
/**
 * GET /api/admin/community
 * Get all community links (including inactive) - admin only
 */
router.get('/community', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const links = await database_1.prisma.communityLink.findMany({
        orderBy: { displayOrder: 'asc' },
    });
    return res.json({
        success: true,
        data: links,
    });
}));
/**
 * POST /api/admin/community
 * Create new community link - admin only
 */
router.post('/community', (0, validation_1.validate)([
    (0, express_validator_1.body)('platform').isIn(Object.values(client_1.CommunityPlatform)).withMessage('Invalid community platform'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('externalLink').isURL().withMessage('External link must be a valid URL'),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const link = await contentService_1.ContentService.createCommunityLink(req.body);
    return res.status(201).json({
        success: true,
        data: link,
    });
}));
/**
 * PUT /api/admin/community/:id
 * Update community link - admin only
 */
router.put('/community/:id', (0, validation_1.validate)([
    (0, express_validator_1.body)('platform').optional().isIn(Object.values(client_1.CommunityPlatform)),
    (0, express_validator_1.body)('title').optional().notEmpty(),
    (0, express_validator_1.body)('externalLink').optional().isURL(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('displayOrder').optional().isInt({ min: 0 }),
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const link = await contentService_1.ContentService.updateCommunityLink(id, req.body);
    return res.json({
        success: true,
        data: link,
    });
}));
/**
 * DELETE /api/admin/community/:id
 * Delete community link (soft delete) - admin only
 */
router.delete('/community/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await contentService_1.ContentService.deleteCommunityLink(id);
    return res.json({
        success: true,
        message: 'Community link deleted successfully',
    });
}));
exports.default = router;
//# sourceMappingURL=adminContent.js.map
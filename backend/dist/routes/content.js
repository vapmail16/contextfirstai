"use strict";
/**
 * Content Routes
 * TDD Approach: This file will be implemented to make tests pass (GREEN phase)
 *
 * Public endpoints for content display (no authentication required)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contentService_1 = require("../services/contentService");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
/**
 * GET /api/content/trainings
 * Get all active trainings
 */
router.get('/trainings', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const trainings = await contentService_1.ContentService.getActiveTrainings();
    return res.json({
        success: true,
        data: trainings,
    });
}));
/**
 * GET /api/content/trainings/featured
 * Get featured trainings
 */
router.get('/trainings/featured', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const trainings = await contentService_1.ContentService.getFeaturedTrainings();
    return res.json({
        success: true,
        data: trainings,
    });
}));
/**
 * GET /api/content/trainings/:id
 * Get training by id
 */
router.get('/trainings/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const training = await contentService_1.ContentService.getTrainingById(id);
    // Only return active trainings to public
    if (!training.isActive) {
        return res.status(404).json({
            success: false,
            error: 'Training not found',
        });
    }
    return res.json({
        success: true,
        data: training,
    });
}));
/**
 * GET /api/content/tools
 * Get all active tools
 */
router.get('/tools', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const tools = await contentService_1.ContentService.getActiveTools();
    return res.json({
        success: true,
        data: tools,
    });
}));
/**
 * GET /api/content/tools/:id
 * Get tool by id
 */
router.get('/tools/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const tool = await contentService_1.ContentService.getToolById(id);
    if (!tool.isActive) {
        return res.status(404).json({
            success: false,
            error: 'Tool not found',
        });
    }
    return res.json({
        success: true,
        data: tool,
    });
}));
/**
 * GET /api/content/products
 * Get all active products
 */
router.get('/products', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const products = await contentService_1.ContentService.getActiveProducts();
    return res.json({
        success: true,
        data: products,
    });
}));
/**
 * GET /api/content/products/:id
 * Get product by id
 */
router.get('/products/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const product = await contentService_1.ContentService.getProductById(id);
    if (!product.isActive) {
        return res.status(404).json({
            success: false,
            error: 'Product not found',
        });
    }
    return res.json({
        success: true,
        data: product,
    });
}));
/**
 * GET /api/content/knowledge
 * Get all active knowledge articles
 */
router.get('/knowledge', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const articles = await contentService_1.ContentService.getActiveKnowledgeArticles();
    return res.json({
        success: true,
        data: articles,
    });
}));
/**
 * GET /api/content/knowledge/search?q=query
 * Search knowledge articles
 * NOTE: Must be defined before /:id route to avoid route conflict
 */
router.get('/knowledge/search', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query.q;
    if (!query || query.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Search query is required',
        });
    }
    const articles = await contentService_1.ContentService.searchKnowledgeArticles(query);
    return res.json({
        success: true,
        data: articles,
    });
}));
/**
 * GET /api/content/knowledge/:id
 * Get knowledge article by id
 */
router.get('/knowledge/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const article = await contentService_1.ContentService.getKnowledgeArticleById(id);
    if (!article.isActive) {
        return res.status(404).json({
            success: false,
            error: 'Knowledge article not found',
        });
    }
    return res.json({
        success: true,
        data: article,
    });
}));
/**
 * GET /api/content/community
 * Get all active community links
 */
router.get('/community', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const links = await contentService_1.ContentService.getActiveCommunityLinks();
    return res.json({
        success: true,
        data: links,
    });
}));
/**
 * GET /api/content/community/:id
 * Get community link by id
 */
router.get('/community/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const link = await contentService_1.ContentService.getCommunityLinkById(id);
    if (!link.isActive) {
        return res.status(404).json({
            success: false,
            error: 'Community link not found',
        });
    }
    return res.json({
        success: true,
        data: link,
    });
}));
exports.default = router;
//# sourceMappingURL=content.js.map
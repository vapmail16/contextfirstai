"use strict";
/**
 * Content Service
 * TDD Approach: This file implements methods to make tests pass (GREEN phase)
 *
 * Manages content items (trainings, tools, products, etc.) that redirect to external platforms
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const client_1 = require("@prisma/client");
class ContentService {
    // Training methods
    static async createTraining(data) {
        // Validate required fields
        if (!data.title || !data.description || !data.category || !data.level || !data.externalLink) {
            throw new errors_1.ValidationError('Missing required fields: title, description, category, level, externalLink');
        }
        // Validate URL format
        try {
            new URL(data.externalLink);
        }
        catch {
            throw new errors_1.ValidationError('Invalid external link URL format');
        }
        const training = await database_1.prisma.training.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                level: data.level,
                externalLink: data.externalLink,
                duration: data.duration,
                price: data.price,
                image: data.image,
                featured: data.featured ?? false,
                isActive: data.isActive ?? true,
                displayOrder: data.displayOrder ?? 0,
            },
        });
        logger_1.default.info('Training created', { trainingId: training.id, title: training.title });
        return training;
    }
    static async getActiveTrainings() {
        const trainings = await database_1.prisma.training.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                displayOrder: 'asc',
            },
        });
        return trainings;
    }
    static async getFeaturedTrainings() {
        const trainings = await database_1.prisma.training.findMany({
            where: {
                featured: true,
                isActive: true,
            },
            orderBy: {
                displayOrder: 'asc',
            },
        });
        return trainings;
    }
    static async getTrainingById(id) {
        const training = await database_1.prisma.training.findUnique({
            where: { id },
        });
        if (!training) {
            throw new errors_1.NotFoundError('Training not found');
        }
        return training;
    }
    static async updateTraining(id, data) {
        // Check if training exists
        const existing = await database_1.prisma.training.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Training not found');
        }
        // Validate URL if externalLink is being updated
        if (data.externalLink) {
            try {
                new URL(data.externalLink);
            }
            catch {
                throw new errors_1.ValidationError('Invalid external link URL format');
            }
        }
        const updated = await database_1.prisma.training.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.category && { category: data.category }),
                ...(data.level && { level: data.level }),
                ...(data.externalLink && { externalLink: data.externalLink }),
                ...(data.duration !== undefined && { duration: data.duration }),
                ...(data.price !== undefined && { price: data.price }),
                ...(data.image !== undefined && { image: data.image }),
                ...(data.featured !== undefined && { featured: data.featured }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
            },
        });
        logger_1.default.info('Training updated', { trainingId: updated.id });
        return updated;
    }
    static async deleteTraining(id) {
        // Check if training exists
        const existing = await database_1.prisma.training.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Training not found');
        }
        // Soft delete (set isActive to false)
        await database_1.prisma.training.update({
            where: { id },
            data: { isActive: false },
        });
        logger_1.default.info('Training deleted', { trainingId: id });
    }
    // Tool methods
    static async createTool(data) {
        if (!data.title || !data.description || !data.problemSolved || !data.externalLink) {
            throw new errors_1.ValidationError('Missing required fields: title, description, problemSolved, externalLink');
        }
        try {
            new URL(data.externalLink);
        }
        catch {
            throw new errors_1.ValidationError('Invalid external link URL format');
        }
        const tool = await database_1.prisma.tool.create({
            data: {
                title: data.title,
                description: data.description,
                problemSolved: data.problemSolved,
                whoShouldUse: data.whoShouldUse,
                externalLink: data.externalLink,
                image: data.image,
                relatedTrainingIds: data.relatedTrainingIds || [],
                featured: data.featured ?? false,
                isActive: data.isActive ?? true,
                displayOrder: data.displayOrder ?? 0,
            },
        });
        logger_1.default.info('Tool created', { toolId: tool.id, title: tool.title });
        return tool;
    }
    static async getActiveTools() {
        const tools = await database_1.prisma.tool.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
        });
        return tools;
    }
    static async getToolById(id) {
        const tool = await database_1.prisma.tool.findUnique({
            where: { id },
        });
        if (!tool) {
            throw new errors_1.NotFoundError('Tool not found');
        }
        return tool;
    }
    static async updateTool(id, data) {
        const existing = await database_1.prisma.tool.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_1.NotFoundError('Tool not found');
        }
        if (data.externalLink) {
            try {
                new URL(data.externalLink);
            }
            catch {
                throw new errors_1.ValidationError('Invalid external link URL format');
            }
        }
        const updated = await database_1.prisma.tool.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.problemSolved && { problemSolved: data.problemSolved }),
                ...(data.whoShouldUse !== undefined && { whoShouldUse: data.whoShouldUse }),
                ...(data.externalLink && { externalLink: data.externalLink }),
                ...(data.image !== undefined && { image: data.image }),
                ...(data.relatedTrainingIds !== undefined && { relatedTrainingIds: data.relatedTrainingIds }),
                ...(data.featured !== undefined && { featured: data.featured }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
            },
        });
        logger_1.default.info('Tool updated', { toolId: updated.id });
        return updated;
    }
    static async deleteTool(id) {
        const existing = await database_1.prisma.tool.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_1.NotFoundError('Tool not found');
        }
        await database_1.prisma.tool.update({
            where: { id },
            data: { isActive: false },
        });
        logger_1.default.info('Tool deleted', { toolId: id });
    }
    // Product methods
    static async createProduct(data) {
        if (!data.title || !data.description || !data.problemSolved || !data.status || !data.externalLink) {
            throw new errors_1.ValidationError('Missing required fields: title, description, problemSolved, status, externalLink');
        }
        if (!Object.values(client_1.ProductStatus).includes(data.status)) {
            throw new errors_1.ValidationError('Invalid product status');
        }
        try {
            new URL(data.externalLink);
        }
        catch {
            throw new errors_1.ValidationError('Invalid external link URL format');
        }
        const product = await database_1.prisma.product.create({
            data: {
                title: data.title,
                description: data.description,
                problemSolved: data.problemSolved,
                status: data.status,
                externalLink: data.externalLink,
                pricing: data.pricing,
                image: data.image,
                featured: data.featured ?? false,
                isActive: data.isActive ?? true,
                displayOrder: data.displayOrder ?? 0,
            },
        });
        logger_1.default.info('Product created', { productId: product.id, title: product.title });
        return product;
    }
    static async getActiveProducts() {
        const products = await database_1.prisma.product.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
        });
        return products;
    }
    static async getProductById(id) {
        const product = await database_1.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new errors_1.NotFoundError('Product not found');
        }
        return product;
    }
    static async updateProduct(id, data) {
        const existing = await database_1.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_1.NotFoundError('Product not found');
        }
        if (data.status && !Object.values(client_1.ProductStatus).includes(data.status)) {
            throw new errors_1.ValidationError('Invalid product status');
        }
        if (data.externalLink) {
            try {
                new URL(data.externalLink);
            }
            catch {
                throw new errors_1.ValidationError('Invalid external link URL format');
            }
        }
        const updated = await database_1.prisma.product.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.problemSolved && { problemSolved: data.problemSolved }),
                ...(data.status && { status: data.status }),
                ...(data.externalLink && { externalLink: data.externalLink }),
                ...(data.pricing !== undefined && { pricing: data.pricing }),
                ...(data.image !== undefined && { image: data.image }),
                ...(data.featured !== undefined && { featured: data.featured }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
            },
        });
        logger_1.default.info('Product updated', { productId: updated.id });
        return updated;
    }
    static async deleteProduct(id) {
        const existing = await database_1.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_1.NotFoundError('Product not found');
        }
        await database_1.prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
        logger_1.default.info('Product deleted', { productId: id });
    }
    // Knowledge Article methods
    static async createKnowledgeArticle(data) {
        if (!data.title || !data.description || !data.content || !data.category) {
            throw new errors_1.ValidationError('Missing required fields: title, description, content, category');
        }
        if (!Object.values(client_1.KnowledgeCategory).includes(data.category)) {
            throw new errors_1.ValidationError('Invalid knowledge category');
        }
        if (data.externalLink) {
            try {
                new URL(data.externalLink);
            }
            catch {
                throw new errors_1.ValidationError('Invalid external link URL format');
            }
        }
        const article = await database_1.prisma.knowledgeArticle.create({
            data: {
                title: data.title,
                description: data.description,
                content: data.content,
                category: data.category,
                readTime: data.readTime,
                image: data.image,
                externalLink: data.externalLink,
                featured: data.featured ?? false,
                isActive: data.isActive ?? true,
                displayOrder: data.displayOrder ?? 0,
            },
        });
        logger_1.default.info('Knowledge article created', { articleId: article.id, title: article.title });
        return article;
    }
    static async getActiveKnowledgeArticles() {
        const articles = await database_1.prisma.knowledgeArticle.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
        });
        return articles;
    }
    static async getKnowledgeArticleById(id) {
        const article = await database_1.prisma.knowledgeArticle.findUnique({
            where: { id },
        });
        if (!article) {
            throw new errors_1.NotFoundError('Knowledge article not found');
        }
        return article;
    }
    static async searchKnowledgeArticles(query) {
        const articles = await database_1.prisma.knowledgeArticle.findMany({
            where: {
                isActive: true,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                ],
            },
            orderBy: { displayOrder: 'asc' },
        });
        return articles;
    }
    static async updateKnowledgeArticle(id, data) {
        const existing = await database_1.prisma.knowledgeArticle.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_1.NotFoundError('Knowledge article not found');
        }
        if (data.category && !Object.values(client_1.KnowledgeCategory).includes(data.category)) {
            throw new errors_1.ValidationError('Invalid knowledge category');
        }
        if (data.externalLink) {
            try {
                new URL(data.externalLink);
            }
            catch {
                throw new errors_1.ValidationError('Invalid external link URL format');
            }
        }
        const updated = await database_1.prisma.knowledgeArticle.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.content && { content: data.content }),
                ...(data.category && { category: data.category }),
                ...(data.readTime !== undefined && { readTime: data.readTime }),
                ...(data.image !== undefined && { image: data.image }),
                ...(data.externalLink !== undefined && { externalLink: data.externalLink }),
                ...(data.featured !== undefined && { featured: data.featured }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
            },
        });
        logger_1.default.info('Knowledge article updated', { articleId: updated.id });
        return updated;
    }
    static async deleteKnowledgeArticle(id) {
        const existing = await database_1.prisma.knowledgeArticle.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_1.NotFoundError('Knowledge article not found');
        }
        await database_1.prisma.knowledgeArticle.update({
            where: { id },
            data: { isActive: false },
        });
        logger_1.default.info('Knowledge article deleted', { articleId: id });
    }
    // Community Link methods
    static async createCommunityLink(data) {
        if (!data.platform || !data.title || !data.externalLink) {
            throw new errors_1.ValidationError('Missing required fields: platform, title, externalLink');
        }
        if (!Object.values(client_1.CommunityPlatform).includes(data.platform)) {
            throw new errors_1.ValidationError('Invalid community platform');
        }
        try {
            new URL(data.externalLink);
        }
        catch {
            throw new errors_1.ValidationError('Invalid external link URL format');
        }
        const link = await database_1.prisma.communityLink.create({
            data: {
                platform: data.platform,
                title: data.title,
                description: data.description,
                externalLink: data.externalLink,
                image: data.image,
                isActive: data.isActive ?? true,
                displayOrder: data.displayOrder ?? 0,
            },
        });
        logger_1.default.info('Community link created', { linkId: link.id, platform: link.platform });
        return link;
    }
    static async getActiveCommunityLinks() {
        const links = await database_1.prisma.communityLink.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
        });
        return links;
    }
    static async getCommunityLinkById(id) {
        const link = await database_1.prisma.communityLink.findUnique({
            where: { id },
        });
        if (!link) {
            throw new errors_1.NotFoundError('Community link not found');
        }
        return link;
    }
    static async updateCommunityLink(id, data) {
        const existing = await database_1.prisma.communityLink.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_1.NotFoundError('Community link not found');
        }
        if (data.platform && !Object.values(client_1.CommunityPlatform).includes(data.platform)) {
            throw new errors_1.ValidationError('Invalid community platform');
        }
        if (data.externalLink) {
            try {
                new URL(data.externalLink);
            }
            catch {
                throw new errors_1.ValidationError('Invalid external link URL format');
            }
        }
        const updated = await database_1.prisma.communityLink.update({
            where: { id },
            data: {
                ...(data.platform && { platform: data.platform }),
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.externalLink && { externalLink: data.externalLink }),
                ...(data.image !== undefined && { image: data.image }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
            },
        });
        logger_1.default.info('Community link updated', { linkId: updated.id });
        return updated;
    }
    static async deleteCommunityLink(id) {
        const existing = await database_1.prisma.communityLink.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_1.NotFoundError('Community link not found');
        }
        await database_1.prisma.communityLink.update({
            where: { id },
            data: { isActive: false },
        });
        logger_1.default.info('Community link deleted', { linkId: id });
    }
}
exports.ContentService = ContentService;
//# sourceMappingURL=contentService.js.map
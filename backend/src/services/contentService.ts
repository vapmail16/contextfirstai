/**
 * Content Service
 * TDD Approach: This file implements methods to make tests pass (GREEN phase)
 * 
 * Manages content items (trainings, tools, products, etc.) that redirect to external platforms
 */

import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import {
  Training,
  TrainingCategory,
  TrainingLevel,
  Tool,
  Product,
  ProductStatus,
  KnowledgeArticle,
  KnowledgeCategory,
  CommunityLink,
  CommunityPlatform,
} from '@prisma/client';

interface CreateTrainingData {
  title: string;
  description: string;
  category: TrainingCategory;
  level: TrainingLevel;
  externalLink: string;
  duration?: number;
  price?: number;
  image?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

interface UpdateTrainingData {
  title?: string;
  description?: string;
  category?: TrainingCategory;
  level?: TrainingLevel;
  externalLink?: string;
  duration?: number;
  price?: number;
  image?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export class ContentService {
  // Training methods
  static async createTraining(data: CreateTrainingData): Promise<Training> {
    // Validate required fields
    if (!data.title || !data.description || !data.category || !data.level || !data.externalLink) {
      throw new ValidationError('Missing required fields: title, description, category, level, externalLink');
    }

    // Validate URL format
    try {
      new URL(data.externalLink);
    } catch {
      throw new ValidationError('Invalid external link URL format');
    }

    const training = await prisma.training.create({
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

    logger.info('Training created', { trainingId: training.id, title: training.title });
    return training;
  }

  static async getActiveTrainings(): Promise<Training[]> {
    const trainings = await prisma.training.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return trainings;
  }

  static async getFeaturedTrainings(): Promise<Training[]> {
    const trainings = await prisma.training.findMany({
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

  static async getTrainingById(id: string): Promise<Training> {
    const training = await prisma.training.findUnique({
      where: { id },
    });

    if (!training) {
      throw new NotFoundError('Training not found');
    }

    return training;
  }

  static async updateTraining(id: string, data: UpdateTrainingData): Promise<Training> {
    // Check if training exists
    const existing = await prisma.training.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Training not found');
    }

    // Validate URL if externalLink is being updated
    if (data.externalLink) {
      try {
        new URL(data.externalLink);
      } catch {
        throw new ValidationError('Invalid external link URL format');
      }
    }

    const updated = await prisma.training.update({
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

    logger.info('Training updated', { trainingId: updated.id });
    return updated;
  }

  static async deleteTraining(id: string): Promise<void> {
    // Check if training exists
    const existing = await prisma.training.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Training not found');
    }

    // Soft delete (set isActive to false)
    await prisma.training.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info('Training deleted', { trainingId: id });
  }

  // Tool methods
  static async createTool(data: any): Promise<Tool> {
    if (!data.title || !data.description || !data.problemSolved || !data.externalLink) {
      throw new ValidationError('Missing required fields: title, description, problemSolved, externalLink');
    }

    try {
      new URL(data.externalLink);
    } catch {
      throw new ValidationError('Invalid external link URL format');
    }

    const tool = await prisma.tool.create({
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

    logger.info('Tool created', { toolId: tool.id, title: tool.title });
    return tool;
  }

  static async getActiveTools(): Promise<Tool[]> {
    const tools = await prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return tools;
  }

  static async getToolById(id: string): Promise<Tool> {
    const tool = await prisma.tool.findUnique({
      where: { id },
    });

    if (!tool) {
      throw new NotFoundError('Tool not found');
    }

    return tool;
  }

  static async updateTool(id: string, data: any): Promise<Tool> {
    const existing = await prisma.tool.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Tool not found');
    }

    if (data.externalLink) {
      try {
        new URL(data.externalLink);
      } catch {
        throw new ValidationError('Invalid external link URL format');
      }
    }

    const updated = await prisma.tool.update({
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

    logger.info('Tool updated', { toolId: updated.id });
    return updated;
  }

  static async deleteTool(id: string): Promise<void> {
    const existing = await prisma.tool.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Tool not found');
    }

    await prisma.tool.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info('Tool deleted', { toolId: id });
  }

  // Product methods
  static async createProduct(data: any): Promise<Product> {
    if (!data.title || !data.description || !data.problemSolved || !data.status || !data.externalLink) {
      throw new ValidationError('Missing required fields: title, description, problemSolved, status, externalLink');
    }

    if (!Object.values(ProductStatus).includes(data.status)) {
      throw new ValidationError('Invalid product status');
    }

    try {
      new URL(data.externalLink);
    } catch {
      throw new ValidationError('Invalid external link URL format');
    }

    const product = await prisma.product.create({
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

    logger.info('Product created', { productId: product.id, title: product.title });
    return product;
  }

  static async getActiveProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return products;
  }

  static async getProductById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  static async updateProduct(id: string, data: any): Promise<Product> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    if (data.status && !Object.values(ProductStatus).includes(data.status)) {
      throw new ValidationError('Invalid product status');
    }

    if (data.externalLink) {
      try {
        new URL(data.externalLink);
      } catch {
        throw new ValidationError('Invalid external link URL format');
      }
    }

    const updated = await prisma.product.update({
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

    logger.info('Product updated', { productId: updated.id });
    return updated;
  }

  static async deleteProduct(id: string): Promise<void> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info('Product deleted', { productId: id });
  }

  // Knowledge Article methods
  static async createKnowledgeArticle(data: any): Promise<KnowledgeArticle> {
    if (!data.title || !data.description || !data.content || !data.category) {
      throw new ValidationError('Missing required fields: title, description, content, category');
    }

    if (!Object.values(KnowledgeCategory).includes(data.category)) {
      throw new ValidationError('Invalid knowledge category');
    }

    if (data.externalLink) {
      try {
        new URL(data.externalLink);
      } catch {
        throw new ValidationError('Invalid external link URL format');
      }
    }

    const article = await prisma.knowledgeArticle.create({
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

    logger.info('Knowledge article created', { articleId: article.id, title: article.title });
    return article;
  }

  static async getActiveKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    const articles = await prisma.knowledgeArticle.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return articles;
  }

  static async getKnowledgeArticleById(id: string): Promise<KnowledgeArticle> {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundError('Knowledge article not found');
    }

    return article;
  }

  static async searchKnowledgeArticles(query: string): Promise<KnowledgeArticle[]> {
    const articles = await prisma.knowledgeArticle.findMany({
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

  static async updateKnowledgeArticle(id: string, data: any): Promise<KnowledgeArticle> {
    const existing = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Knowledge article not found');
    }

    if (data.category && !Object.values(KnowledgeCategory).includes(data.category)) {
      throw new ValidationError('Invalid knowledge category');
    }

    if (data.externalLink) {
      try {
        new URL(data.externalLink);
      } catch {
        throw new ValidationError('Invalid external link URL format');
      }
    }

    const updated = await prisma.knowledgeArticle.update({
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

    logger.info('Knowledge article updated', { articleId: updated.id });
    return updated;
  }

  static async deleteKnowledgeArticle(id: string): Promise<void> {
    const existing = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Knowledge article not found');
    }

    await prisma.knowledgeArticle.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info('Knowledge article deleted', { articleId: id });
  }

  // Community Link methods
  static async createCommunityLink(data: any): Promise<CommunityLink> {
    if (!data.platform || !data.title || !data.externalLink) {
      throw new ValidationError('Missing required fields: platform, title, externalLink');
    }

    if (!Object.values(CommunityPlatform).includes(data.platform)) {
      throw new ValidationError('Invalid community platform');
    }

    try {
      new URL(data.externalLink);
    } catch {
      throw new ValidationError('Invalid external link URL format');
    }

    const link = await prisma.communityLink.create({
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

    logger.info('Community link created', { linkId: link.id, platform: link.platform });
    return link;
  }

  static async getActiveCommunityLinks(): Promise<CommunityLink[]> {
    const links = await prisma.communityLink.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return links;
  }

  static async getCommunityLinkById(id: string): Promise<CommunityLink> {
    const link = await prisma.communityLink.findUnique({
      where: { id },
    });

    if (!link) {
      throw new NotFoundError('Community link not found');
    }

    return link;
  }

  static async updateCommunityLink(id: string, data: any): Promise<CommunityLink> {
    const existing = await prisma.communityLink.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Community link not found');
    }

    if (data.platform && !Object.values(CommunityPlatform).includes(data.platform)) {
      throw new ValidationError('Invalid community platform');
    }

    if (data.externalLink) {
      try {
        new URL(data.externalLink);
      } catch {
        throw new ValidationError('Invalid external link URL format');
      }
    }

    const updated = await prisma.communityLink.update({
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

    logger.info('Community link updated', { linkId: updated.id });
    return updated;
  }

  static async deleteCommunityLink(id: string): Promise<void> {
    const existing = await prisma.communityLink.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Community link not found');
    }

    await prisma.communityLink.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info('Community link deleted', { linkId: id });
  }
}


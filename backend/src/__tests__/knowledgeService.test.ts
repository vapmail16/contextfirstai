/**
 * Knowledge Article Service Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { prisma } from '../config/database';
import { ContentService } from '../services/contentService';
import { ValidationError } from '../utils/errors';

describe('ContentService - Knowledge Article', () => {
  beforeEach(async () => {
    await prisma.knowledgeArticle.deleteMany();
  });

  afterAll(async () => {
    await prisma.knowledgeArticle.deleteMany();
    await prisma.$disconnect();
  });

  describe('createKnowledgeArticle', () => {
    it('should create a knowledge article', async () => {
      const articleData = {
        title: 'Understanding Transformers',
        description: 'Introduction to transformer architecture',
        content: '# Transformers\n\nTransformers are...',
        category: 'CORE_CONCEPTS',
        readTime: 10,
        featured: false,
        isActive: true,
        displayOrder: 1,
      };

      const article = await ContentService.createKnowledgeArticle(articleData);

      expect(article).toBeDefined();
      expect(article.id).toBeDefined();
      expect(article.title).toBe(articleData.title);
      expect(article.category).toBe(articleData.category);
      expect(article.readTime).toBe(articleData.readTime);
    });

    it('should throw ValidationError for missing required fields', async () => {
      const invalidData = {
        title: 'Test Article',
        // Missing description, content, category
      };

      await expect(
        ContentService.createKnowledgeArticle(invalidData as any)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getActiveKnowledgeArticles', () => {
    it('should return only active articles', async () => {
      await prisma.knowledgeArticle.createMany({
        data: [
          {
            title: 'Active Article 1',
            description: 'Description',
            content: 'Content',
            category: 'CORE_CONCEPTS',
            readTime: 5,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Inactive Article',
            description: 'Description',
            content: 'Content',
            category: 'CORE_CONCEPTS',
            readTime: 5,
            isActive: false,
            displayOrder: 2,
          },
        ],
      });

      const articles = await ContentService.getActiveKnowledgeArticles();

      expect(articles).toHaveLength(1);
      expect(articles[0].isActive).toBe(true);
    });
  });

  describe('searchKnowledgeArticles', () => {
    it('should search articles by title', async () => {
      await prisma.knowledgeArticle.createMany({
        data: [
          {
            title: 'Understanding AI',
            description: 'Description',
            content: 'Content about AI',
            category: 'CORE_CONCEPTS',
            readTime: 5,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Machine Learning Basics',
            description: 'Description',
            content: 'Content about ML',
            category: 'CORE_CONCEPTS',
            readTime: 5,
            isActive: true,
            displayOrder: 2,
          },
        ],
      });

      const results = await ContentService.searchKnowledgeArticles('AI');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(a => a.title.includes('AI'))).toBe(true);
    });
  });
});


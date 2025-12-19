/**
 * Tool Service Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { prisma } from '../config/database';
import { ContentService } from '../services/contentService';
import { NotFoundError, ValidationError } from '../utils/errors';

describe('ContentService - Tool', () => {
  beforeEach(async () => {
    await prisma.tool.deleteMany();
  });

  afterAll(async () => {
    await prisma.tool.deleteMany();
    await prisma.$disconnect();
  });

  describe('createTool', () => {
    it('should create a tool with external link', async () => {
      const toolData = {
        title: 'Cursor',
        description: 'AI-powered code editor',
        problemSolved: 'Faster coding with AI assistance',
        whoShouldUse: 'Developers and builders',
        externalLink: 'https://cursor.sh',
        featured: false,
        isActive: true,
        displayOrder: 1,
      };

      const tool = await ContentService.createTool(toolData);

      expect(tool).toBeDefined();
      expect(tool.id).toBeDefined();
      expect(tool.title).toBe(toolData.title);
      expect(tool.externalLink).toBe(toolData.externalLink);
      expect(tool.problemSolved).toBe(toolData.problemSolved);
    });

    it('should throw ValidationError for missing external link', async () => {
      const invalidData = {
        title: 'Test Tool',
        description: 'Test',
        // Missing externalLink
      };

      await expect(
        ContentService.createTool(invalidData as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should allow related training IDs', async () => {
      // Create a training first
      const training = await prisma.training.create({
        data: {
          title: 'Training',
          description: 'Description',
          category: 'INTRODUCTORY' as any,
          level: 'BEGINNER' as any,
          externalLink: 'https://example.com',
          duration: 60,
          price: 0,
          isActive: true,
          displayOrder: 1,
        },
      });

      const toolData = {
        title: 'Tool with Related Training',
        description: 'Description',
        problemSolved: 'Problem',
        whoShouldUse: 'Users',
        externalLink: 'https://example.com/tool',
        relatedTrainingIds: [training.id],
        isActive: true,
        displayOrder: 1,
      };

      const tool = await ContentService.createTool(toolData);

      expect(tool).toBeDefined();
      expect(tool.relatedTrainingIds).toContain(training.id);
    });
  });

  describe('getActiveTools', () => {
    it('should return only active tools', async () => {
      await prisma.tool.createMany({
        data: [
          {
            title: 'Active Tool 1',
            description: 'Description',
            problemSolved: 'Problem',
            whoShouldUse: 'Users',
            externalLink: 'https://example.com/1',
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Active Tool 2',
            description: 'Description',
            problemSolved: 'Problem',
            whoShouldUse: 'Users',
            externalLink: 'https://example.com/2',
            isActive: true,
            displayOrder: 2,
          },
          {
            title: 'Inactive Tool',
            description: 'Description',
            problemSolved: 'Problem',
            whoShouldUse: 'Users',
            externalLink: 'https://example.com/3',
            isActive: false,
            displayOrder: 3,
          },
        ],
      });

      const tools = await ContentService.getActiveTools();

      expect(tools).toHaveLength(2);
      expect(tools.every(t => t.isActive)).toBe(true);
    });
  });

  describe('getToolById', () => {
    it('should get tool by id', async () => {
      const tool = await prisma.tool.create({
        data: {
          title: 'Test Tool',
          description: 'Test Description',
          problemSolved: 'Problem',
          whoShouldUse: 'Users',
          externalLink: 'https://example.com',
          isActive: true,
          displayOrder: 1,
        },
      });

      const result = await ContentService.getToolById(tool.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(tool.id);
      expect(result.title).toBe(tool.title);
    });

    it('should throw NotFoundError for non-existent tool', async () => {
      await expect(
        ContentService.getToolById('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });
});


/**
 * Content Service Tests
 * TDD Approach: Write tests first (RED phase)
 * 
 * This service manages content items (trainings, tools, products, etc.)
 * that redirect users to external platforms.
 */

import { prisma } from '../config/database';
import { ContentService } from '../services/contentService';
import { NotFoundError, ValidationError } from '../utils/errors';
import { TrainingCategory, TrainingLevel } from '@prisma/client';

describe('ContentService - Training', () => {
  beforeEach(async () => {
    await prisma.training.deleteMany();
  });

  afterAll(async () => {
    await prisma.training.deleteMany();
    await prisma.$disconnect();
  });

  describe('createTraining', () => {
    it('should create a training with external link', async () => {
      const trainingData = {
        title: 'Introduction to AI',
        description: 'Learn the basics of AI',
        category: TrainingCategory.INTRODUCTORY,
        level: TrainingLevel.BEGINNER,
        externalLink: 'https://youtube.com/watch?v=abc123',
        duration: 120,
        price: 0,
        featured: false,
        isActive: true,
        displayOrder: 1,
      };

      const training = await ContentService.createTraining(trainingData);

      expect(training).toBeDefined();
      expect(training.id).toBeDefined();
      expect(training.title).toBe(trainingData.title);
      expect(training.externalLink).toBe(trainingData.externalLink);
      expect(training.category).toBe(trainingData.category);
    });

    it('should throw ValidationError for missing external link', async () => {
      const invalidData = {
        title: 'Test Training',
        description: 'Test',
        category: TrainingCategory.INTRODUCTORY,
        level: TrainingLevel.BEGINNER,
        // Missing externalLink
      };

      await expect(
        ContentService.createTraining(invalidData as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid URL', async () => {
      const invalidData = {
        title: 'Test Training',
        externalLink: 'not-a-valid-url',
      };

      await expect(
        ContentService.createTraining(invalidData as any)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getActiveTrainings', () => {
    it('should return only active trainings', async () => {
      await prisma.training.createMany({
        data: [
          {
            title: 'Active Training 1',
            description: 'Description',
            category: 'INTRODUCTORY',
            level: 'BEGINNER',
            externalLink: 'https://example.com/1',
            duration: 60,
            price: 0,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Active Training 2',
            description: 'Description',
            category: TrainingCategory.TOOL_BASED,
            level: TrainingLevel.INTERMEDIATE,
            externalLink: 'https://example.com/2',
            duration: 120,
            price: 0,
            isActive: true,
            displayOrder: 2,
          },
          {
            title: 'Inactive Training',
            description: 'Description',
            category: 'INTRODUCTORY',
            level: 'BEGINNER',
            externalLink: 'https://example.com/3',
            duration: 60,
            price: 0,
            isActive: false,
            displayOrder: 3,
          },
        ],
      });

      const trainings = await ContentService.getActiveTrainings();

      expect(trainings).toHaveLength(2);
      expect(trainings.every(t => t.isActive)).toBe(true);
    });

    it('should return trainings ordered by displayOrder', async () => {
      await prisma.training.createMany({
        data: [
          {
            title: 'Third',
            description: 'Description',
            category: 'INTRODUCTORY',
            level: 'BEGINNER',
            externalLink: 'https://example.com/3',
            duration: 60,
            price: 0,
            isActive: true,
            displayOrder: 3,
          },
          {
            title: 'First',
            description: 'Description',
            category: 'INTRODUCTORY',
            level: 'BEGINNER',
            externalLink: 'https://example.com/1',
            duration: 60,
            price: 0,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Second',
            description: 'Description',
            category: 'INTRODUCTORY',
            level: 'BEGINNER',
            externalLink: 'https://example.com/2',
            duration: 60,
            price: 0,
            isActive: true,
            displayOrder: 2,
          },
        ],
      });

      const trainings = await ContentService.getActiveTrainings();

      expect(trainings).toHaveLength(3);
      expect(trainings[0].displayOrder).toBe(1);
      expect(trainings[1].displayOrder).toBe(2);
      expect(trainings[2].displayOrder).toBe(3);
    });
  });

  describe('getFeaturedTrainings', () => {
    it('should return only featured and active trainings', async () => {
      await prisma.training.createMany({
        data: [
          {
            title: 'Featured 1',
            description: 'Description',
            category: 'INTRODUCTORY',
            level: 'BEGINNER',
            externalLink: 'https://example.com/1',
            duration: 60,
            price: 0,
            featured: true,
            isActive: true,
            displayOrder: 1,
          },
          {
            title: 'Not Featured',
            description: 'Description',
            category: 'INTRODUCTORY',
            level: 'BEGINNER',
            externalLink: 'https://example.com/2',
            duration: 60,
            price: 0,
            featured: false,
            isActive: true,
            displayOrder: 2,
          },
          {
            title: 'Featured Inactive',
            description: 'Description',
            category: 'INTRODUCTORY',
            level: 'BEGINNER',
            externalLink: 'https://example.com/3',
            duration: 60,
            price: 0,
            featured: true,
            isActive: false,
            displayOrder: 3,
          },
        ],
      });

      const featured = await ContentService.getFeaturedTrainings();

      expect(featured).toHaveLength(1);
      expect(featured[0].featured).toBe(true);
      expect(featured[0].isActive).toBe(true);
    });
  });

  describe('getTrainingById', () => {
    it('should get training by id', async () => {
      const training = await prisma.training.create({
        data: {
          title: 'Test Training',
          description: 'Test Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com',
          duration: 60,
          price: 0,
          isActive: true,
          displayOrder: 1,
        },
      });

      const result = await ContentService.getTrainingById(training.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(training.id);
      expect(result.title).toBe(training.title);
    });

    it('should throw NotFoundError for non-existent training', async () => {
      await expect(
        ContentService.getTrainingById('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateTraining', () => {
    it('should update training', async () => {
      const training = await prisma.training.create({
        data: {
          title: 'Original Title',
          description: 'Original Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com/original',
          duration: 60,
          price: 0,
          isActive: true,
          displayOrder: 1,
        },
      });

      const updated = await ContentService.updateTraining(training.id, {
        title: 'Updated Title',
        externalLink: 'https://example.com/updated',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.externalLink).toBe('https://example.com/updated');
    });

    it('should throw NotFoundError for non-existent training', async () => {
      await expect(
        ContentService.updateTraining('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteTraining', () => {
    it('should soft delete training', async () => {
      const training = await prisma.training.create({
        data: {
          title: 'Test Training',
          description: 'Test Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com',
          duration: 60,
          price: 0,
          isActive: true,
          displayOrder: 1,
        },
      });

      await ContentService.deleteTraining(training.id);

      const deleted = await prisma.training.findUnique({
        where: { id: training.id },
      });

      expect(deleted?.isActive).toBe(false);
    });
  });
});


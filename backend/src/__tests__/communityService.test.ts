/**
 * Community Link Service Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { prisma } from '../config/database';
import { ContentService } from '../services/contentService';
import { ValidationError } from '../utils/errors';

describe('ContentService - Community Link', () => {
  beforeEach(async () => {
    await prisma.communityLink.deleteMany();
  });

  afterAll(async () => {
    await prisma.communityLink.deleteMany();
    await prisma.$disconnect();
  });

  describe('createCommunityLink', () => {
    it('should create a community link', async () => {
      const linkData = {
        platform: 'SKOOL',
        title: 'AI Forge Hub Community',
        description: 'Join our community on Skool',
        externalLink: 'https://skool.com/community',
        isActive: true,
        displayOrder: 1,
      };

      const link = await ContentService.createCommunityLink(linkData);

      expect(link).toBeDefined();
      expect(link.id).toBeDefined();
      expect(link.platform).toBe(linkData.platform);
      expect(link.externalLink).toBe(linkData.externalLink);
    });

    it('should throw ValidationError for invalid platform', async () => {
      const invalidData = {
        platform: 'INVALID_PLATFORM',
        title: 'Test',
        externalLink: 'https://example.com',
      };

      await expect(
        ContentService.createCommunityLink(invalidData as any)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getActiveCommunityLinks', () => {
    it('should return only active community links', async () => {
      await prisma.communityLink.createMany({
        data: [
          {
            platform: 'SKOOL',
            title: 'Skool Community',
            description: 'Description',
            externalLink: 'https://skool.com',
            isActive: true,
            displayOrder: 1,
          },
          {
            platform: 'SLACK',
            title: 'Slack Community',
            description: 'Description',
            externalLink: 'https://slack.com',
            isActive: true,
            displayOrder: 2,
          },
          {
            platform: 'SKOOL',
            title: 'Inactive Link',
            description: 'Description',
            externalLink: 'https://example.com',
            isActive: false,
            displayOrder: 3,
          },
        ],
      });

      const links = await ContentService.getActiveCommunityLinks();

      expect(links).toHaveLength(2);
      expect(links.every(l => l.isActive)).toBe(true);
    });
  });
});


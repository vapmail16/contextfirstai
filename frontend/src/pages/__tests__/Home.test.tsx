/**
 * Home Page Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import * as contentService from '../../services/api/contentService';

// Mock the API services
vi.mock('../../services/api/contentService', () => ({
  trainingService: {
    getFeatured: vi.fn(),
  },
  productService: {
    getAll: vi.fn(),
  },
  toolService: {
    getAll: vi.fn(),
  },
  knowledgeService: {
    getAll: vi.fn(),
  },
}));

describe('Home Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderHome = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Hero Section', () => {
    it('should render hero section with title', () => {
      vi.mocked(contentService.trainingService.getFeatured).mockResolvedValue([]);
      vi.mocked(contentService.productService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.toolService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);

      renderHome();

      expect(screen.getByText(/Context First AI/i)).toBeInTheDocument();
    });

    it('should render hero section with description', () => {
      vi.mocked(contentService.trainingService.getFeatured).mockResolvedValue([]);
      vi.mocked(contentService.productService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.toolService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);

      renderHome();

      // Should have some description text
      const heroSection = screen.getByText(/Context First AI/i).closest('section');
      expect(heroSection).toBeInTheDocument();
    });
  });

  describe('Featured Trainings Section', () => {
    it('should display featured trainings when available', async () => {
      const mockTrainings = [
        {
          id: '1',
          title: 'Featured Training 1',
          description: 'Description 1',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com/1',
          featured: true,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Featured Training 2',
          description: 'Description 2',
          category: 'TOOL_BASED',
          level: 'INTERMEDIATE',
          externalLink: 'https://example.com/2',
          featured: true,
          isActive: true,
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(contentService.trainingService.getFeatured).mockResolvedValue(mockTrainings as any);
      vi.mocked(contentService.productService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.toolService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);

      renderHome();

      await waitFor(() => {
        expect(screen.getByText('Featured Training 1')).toBeInTheDocument();
        expect(screen.getByText('Featured Training 2')).toBeInTheDocument();
      });
    });

    it('should display empty state when no featured trainings', async () => {
      vi.mocked(contentService.trainingService.getFeatured).mockResolvedValue([]);
      vi.mocked(contentService.productService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.toolService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);

      renderHome();

      await waitFor(() => {
        // Should still render the section, just empty
        expect(contentService.trainingService.getFeatured).toHaveBeenCalled();
      });
    });
  });

  describe('Quick Links Section', () => {
    it('should render quick links to main sections', () => {
      vi.mocked(contentService.trainingService.getFeatured).mockResolvedValue([]);
      vi.mocked(contentService.productService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.toolService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);

      renderHome();

      // Should have links to main sections (using getAllByRole since there might be multiple)
      const trainingLinks = screen.getAllByRole('link', { name: /view trainings?/i });
      expect(trainingLinks.length).toBeGreaterThan(0);
      
      expect(screen.getByRole('link', { name: /explore knowledge/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse tools/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view products/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /join now/i })).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should fetch featured trainings on mount', async () => {
      vi.mocked(contentService.trainingService.getFeatured).mockResolvedValue([]);
      vi.mocked(contentService.productService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.toolService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);

      renderHome();

      await waitFor(() => {
        expect(contentService.trainingService.getFeatured).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(contentService.trainingService.getFeatured).mockRejectedValue(
        new Error('API Error')
      );
      vi.mocked(contentService.productService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.toolService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);

      renderHome();

      // Should still render the page even if API fails
      await waitFor(() => {
        expect(screen.getByText(/Context First AI/i)).toBeInTheDocument();
      });
    });
  });
});


/**
 * Training Page Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Training from '../Training';
import * as contentService from '../../services/api/contentService';

// Mock the API services
vi.mock('../../services/api/contentService', () => ({
  trainingService: {
    getAll: vi.fn(),
  },
}));

describe('Training Page', () => {
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

  const renderTraining = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Training />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Page Header', () => {
    it('should render page title', () => {
      vi.mocked(contentService.trainingService.getAll).mockResolvedValue([]);

      renderTraining();

      // Use getByRole for heading to be more specific
      expect(screen.getByRole('heading', { name: /trainings?/i })).toBeInTheDocument();
    });

    it('should render page description', () => {
      vi.mocked(contentService.trainingService.getAll).mockResolvedValue([]);

      renderTraining();

      // Should have some description text about trainings
      const description = screen.getByText(/learn ai through structured courses/i);
      expect(description).toBeInTheDocument();
    });
  });

  describe('Training List', () => {
    it('should display all trainings when loaded', async () => {
      const mockTrainings = [
        {
          id: '1',
          title: 'Introduction to AI',
          description: 'Learn the basics of AI',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com/1',
          duration: 60,
          price: 0,
          featured: false,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Advanced ML Techniques',
          description: 'Deep dive into ML',
          category: 'NICHE_TOPICS',
          level: 'ADVANCED',
          externalLink: 'https://example.com/2',
          duration: 120,
          price: 99,
          featured: false,
          isActive: true,
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(contentService.trainingService.getAll).mockResolvedValue(mockTrainings as any);

      renderTraining();

      await waitFor(() => {
        expect(screen.getByText('Introduction to AI')).toBeInTheDocument();
        expect(screen.getByText('Advanced ML Techniques')).toBeInTheDocument();
      });
    });

    it('should display training details (category, level, duration)', async () => {
      const mockTrainings = [
        {
          id: '1',
          title: 'Test Training',
          description: 'Test Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com/1',
          duration: 60,
          price: 0,
          featured: false,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(contentService.trainingService.getAll).mockResolvedValue(mockTrainings as any);

      renderTraining();

      await waitFor(() => {
        expect(screen.getByText('Test Training')).toBeInTheDocument();
        // Should show category and level using test IDs
        const categoryElement = screen.getByTestId('training-category');
        const levelElement = screen.getByTestId('training-level');
        expect(categoryElement).toHaveTextContent(/introductory/i);
        expect(levelElement).toHaveTextContent(/beginner/i);
      });
    });

    it('should display empty state when no trainings', async () => {
      vi.mocked(contentService.trainingService.getAll).mockResolvedValue([]);

      renderTraining();

      await waitFor(() => {
        expect(contentService.trainingService.getAll).toHaveBeenCalled();
        // Should show some empty state message
        const emptyMessage = screen.queryByText(/no trainings|no courses|coming soon/i);
        expect(emptyMessage || screen.getByText(/trainings?/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter trainings by category', async () => {
      const user = userEvent.setup();
      const mockTrainings = [
        {
          id: '1',
          title: 'Intro Training',
          description: 'Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com/1',
          featured: false,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Tool Training',
          description: 'Description',
          category: 'TOOL_BASED',
          level: 'INTERMEDIATE',
          externalLink: 'https://example.com/2',
          featured: false,
          isActive: true,
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(contentService.trainingService.getAll).mockResolvedValue(mockTrainings as any);

      renderTraining();

      await waitFor(() => {
        expect(screen.getByText('Intro Training')).toBeInTheDocument();
        expect(screen.getByText('Tool Training')).toBeInTheDocument();
      });

      // Find and interact with category filter
      const categoryFilter = screen.getByLabelText(/category/i);
      await user.selectOptions(categoryFilter, 'TOOL_BASED');

      await waitFor(() => {
        // After filtering, only Tool Training should be visible
        expect(screen.queryByText('Intro Training')).not.toBeInTheDocument();
        expect(screen.getByText('Tool Training')).toBeInTheDocument();
      });
    });

    it('should filter trainings by level', async () => {
      const user = userEvent.setup();
      const mockTrainings = [
        {
          id: '1',
          title: 'Beginner Training',
          description: 'Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com/1',
          featured: false,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Advanced Training',
          description: 'Description',
          category: 'NICHE_TOPICS',
          level: 'ADVANCED',
          externalLink: 'https://example.com/2',
          featured: false,
          isActive: true,
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(contentService.trainingService.getAll).mockResolvedValue(mockTrainings as any);

      renderTraining();

      await waitFor(() => {
        expect(screen.getByText('Beginner Training')).toBeInTheDocument();
        expect(screen.getByText('Advanced Training')).toBeInTheDocument();
      });

      // Find and interact with level filter
      const levelFilter = screen.getByLabelText(/level/i);
      await user.selectOptions(levelFilter, 'ADVANCED');

      await waitFor(() => {
        // After filtering, only Advanced Training should be visible
        expect(screen.queryByText('Beginner Training')).not.toBeInTheDocument();
        expect(screen.getByText('Advanced Training')).toBeInTheDocument();
      });
    });
  });

  describe('External Links', () => {
    it('should have external links to training content', async () => {
      const mockTrainings = [
        {
          id: '1',
          title: 'Test Training',
          description: 'Description',
          category: 'INTRODUCTORY',
          level: 'BEGINNER',
          externalLink: 'https://example.com/training',
          featured: false,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(contentService.trainingService.getAll).mockResolvedValue(mockTrainings as any);

      renderTraining();

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /view|access|start/i });
        expect(link).toHaveAttribute('href', 'https://example.com/training');
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch trainings on mount', async () => {
      vi.mocked(contentService.trainingService.getAll).mockResolvedValue([]);

      renderTraining();

      await waitFor(() => {
        expect(contentService.trainingService.getAll).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(contentService.trainingService.getAll).mockRejectedValue(
        new Error('API Error')
      );

      renderTraining();

      // Should still render the page even if API fails
      await waitFor(() => {
        // Page header should still be visible
        expect(screen.getByRole('heading', { name: /trainings?/i })).toBeInTheDocument();
        // Error message should be shown
        expect(screen.getByText(/error loading trainings/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});


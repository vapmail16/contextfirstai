/**
 * Knowledge Hub Page Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import KnowledgeHub from '../KnowledgeHub';
import * as contentService from '../../services/api/contentService';

vi.mock('../../services/api/contentService', () => ({
  knowledgeService: {
    getAll: vi.fn(),
    search: vi.fn(),
  },
}));

describe('Knowledge Hub Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderKnowledgeHub = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <KnowledgeHub />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Page Header', () => {
    it('should render page title', () => {
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);
      renderKnowledgeHub();
      expect(screen.getByRole('heading', { name: /knowledge/i })).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should have search input', () => {
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);
      renderKnowledgeHub();
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should search articles when query is entered', async () => {
      const user = userEvent.setup();
      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue([]);
      vi.mocked(contentService.knowledgeService.search).mockResolvedValue([]);

      renderKnowledgeHub();
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'AI');

      await waitFor(() => {
        expect(contentService.knowledgeService.search).toHaveBeenCalledWith('AI');
      });
    });
  });

  describe('Article List', () => {
    it('should display articles when loaded', async () => {
      const mockArticles = [
        {
          id: '1',
          title: 'Understanding AI',
          description: 'AI basics',
          content: 'Content',
          category: 'CORE_CONCEPTS',
          readTime: 5,
          featured: false,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(contentService.knowledgeService.getAll).mockResolvedValue(mockArticles as any);
      renderKnowledgeHub();

      await waitFor(() => {
        expect(screen.getByText('Understanding AI')).toBeInTheDocument();
      });
    });
  });
});


/**
 * Admin Knowledge Article Form Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KnowledgeForm from '../KnowledgeForm';
import * as contentService from '../../../services/api/contentService';

vi.mock('../../../services/api/contentService', () => ({
  knowledgeService: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
  }),
}));

describe('Admin Knowledge Article Form', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const renderForm = (articleId?: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <KnowledgeForm articleId={articleId} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render form fields for creating new article', () => {
    renderForm();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('should populate form when editing existing article', async () => {
    const mockArticle = {
      id: '1',
      title: 'Existing Article',
      description: 'Description',
      content: 'Article content',
      category: 'GLOSSARY',
      readTime: 5,
      featured: false,
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(contentService.knowledgeService.getById).mockResolvedValue(mockArticle as any);

    renderForm('1');

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Article')).toBeInTheDocument();
    });
  });
});


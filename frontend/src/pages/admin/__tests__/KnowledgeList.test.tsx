/**
 * Admin Knowledge Article List Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KnowledgeList from '../KnowledgeList';

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
  }),
}));

describe('Admin Knowledge Article List', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  it('should render article list with edit and delete actions', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Article 1',
        description: 'Description',
        category: 'GLOSSARY',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const axios = await import('axios');
    vi.spyOn(axios.default, 'get').mockResolvedValue({
      data: { success: true, data: mockArticles },
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <KnowledgeList />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Article 1')).toBeInTheDocument();
    });

    const editLinks = screen.getAllByRole('link');
    const deleteButtons = screen.getAllByRole('button');
    expect(editLinks.some(link => link.textContent?.toLowerCase().includes('edit'))).toBe(true);
    expect(deleteButtons.some(btn => btn.textContent?.toLowerCase().includes('delete'))).toBe(true);
  });
});


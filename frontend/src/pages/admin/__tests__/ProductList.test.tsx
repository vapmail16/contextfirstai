/**
 * Admin Product List Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductList from '../ProductList';

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
  }),
}));

describe('Admin Product List', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  it('should render product list with edit and delete actions', async () => {
    const mockProducts = [
      {
        id: '1',
        title: 'Product 1',
        description: 'Description',
        status: 'LIVE',
        externalLink: 'https://example.com',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const axios = await import('axios');
    vi.spyOn(axios.default, 'get').mockResolvedValue({
      data: { success: true, data: mockProducts },
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProductList />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const editLinks = screen.getAllByRole('link');
    const deleteButtons = screen.getAllByRole('button');
    expect(editLinks.some(link => link.textContent?.toLowerCase().includes('edit'))).toBe(true);
    expect(deleteButtons.some(btn => btn.textContent?.toLowerCase().includes('delete'))).toBe(true);
  });
});


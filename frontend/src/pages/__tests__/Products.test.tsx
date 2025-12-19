/**
 * Products Page Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Products from '../Products';
import * as contentService from '../../services/api/contentService';

vi.mock('../../services/api/contentService', () => ({
  productService: {
    getAll: vi.fn(),
  },
}));

describe('Products Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderProducts = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Products />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render page title', () => {
    vi.mocked(contentService.productService.getAll).mockResolvedValue([]);
    renderProducts();
    expect(screen.getByRole('heading', { name: /products?/i })).toBeInTheDocument();
  });

  it('should display products with status badges', async () => {
    const mockProducts = [
      {
        id: '1',
        title: 'PDF Parser',
        description: 'Parse PDFs with AI',
        problemSolved: 'Extract text from PDFs',
        status: 'LIVE',
        externalLink: 'https://example.com',
        featured: false,
        isActive: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    vi.mocked(contentService.productService.getAll).mockResolvedValue(mockProducts as any);
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('PDF Parser')).toBeInTheDocument();
      expect(screen.getByText(/live/i)).toBeInTheDocument();
    });
  });
});


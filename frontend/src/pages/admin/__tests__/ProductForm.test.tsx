/**
 * Admin Product Form Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductForm from '../ProductForm';
import * as contentService from '../../../services/api/contentService';

vi.mock('../../../services/api/contentService', () => ({
  productService: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
  }),
}));

describe('Admin Product Form', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const renderForm = (productId?: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProductForm productId={productId} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render form fields for creating new product', () => {
    renderForm();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/external link/i)).toBeInTheDocument();
  });

  it('should populate form when editing existing product', async () => {
    const mockProduct = {
      id: '1',
      title: 'Existing Product',
      description: 'Description',
      problemSolved: 'Solves problem',
      status: 'LIVE',
      externalLink: 'https://example.com',
      pricing: '$9/month',
      featured: false,
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(contentService.productService.getById).mockResolvedValue(mockProduct as any);

    renderForm('1');

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Product')).toBeInTheDocument();
    });
  });
});


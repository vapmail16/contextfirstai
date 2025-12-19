/**
 * Admin Dashboard Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboard from '../AdminDashboard';

vi.mock('../../services/api/contentService', () => ({
  trainingService: { getAll: vi.fn() },
  toolService: { getAll: vi.fn() },
  productService: { getAll: vi.fn() },
  knowledgeService: { getAll: vi.fn() },
  communityService: { getAll: vi.fn() },
}));

describe('Admin Dashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it('should render admin dashboard title', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /admin|dashboard/i })).toBeInTheDocument();
  });

  it('should render content management sections', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Check for card titles (more specific)
    expect(screen.getByText('Trainings')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });
});


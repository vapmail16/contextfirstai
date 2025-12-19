/**
 * Training Detail Page Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrainingDetail from '../TrainingDetail';
import * as contentService from '../../services/api/contentService';

vi.mock('../../services/api/contentService', () => ({
  trainingService: {
    getById: vi.fn(),
  },
}));

describe('Training Detail Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  it('should render training details when loaded', async () => {
    const mockTraining = {
      id: '1',
      title: 'Test Training',
      description: 'Test Description',
      category: 'INTRODUCTORY',
      level: 'BEGINNER',
      externalLink: 'https://example.com',
      duration: 60,
      price: 0,
      featured: false,
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(contentService.trainingService.getById).mockResolvedValue(mockTraining as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TrainingDetail trainingId="1" />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Training')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });
});


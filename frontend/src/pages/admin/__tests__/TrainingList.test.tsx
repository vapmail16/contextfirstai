/**
 * Admin Training List Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrainingList from '../TrainingList';
import * as contentService from '../../../services/api/contentService';

vi.mock('../../../services/api/contentService', () => ({
  trainingService: {
    getAll: vi.fn(),
  },
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
  }),
}));

describe('Admin Training List', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  it('should render training list with edit and delete actions', async () => {
    const mockTrainings = [
      {
        id: '1',
        title: 'Training 1',
        description: 'Description',
        category: 'INTRODUCTORY',
        level: 'BEGINNER',
        externalLink: 'https://example.com',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Mock axios for admin endpoint
    const axios = await import('axios');
    vi.spyOn(axios.default, 'get').mockResolvedValue({
      data: { success: true, data: mockTrainings },
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TrainingList />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Training 1')).toBeInTheDocument();
    });

    // Check for edit and delete buttons
    const editLinks = screen.getAllByRole('link');
    const deleteButtons = screen.getAllByRole('button');
    expect(editLinks.some(link => link.textContent?.toLowerCase().includes('edit'))).toBe(true);
    expect(deleteButtons.some(btn => btn.textContent?.toLowerCase().includes('delete'))).toBe(true);
  });
});


/**
 * Community Page Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Community from '../Community';
import * as contentService from '../../services/api/contentService';

vi.mock('../../services/api/contentService', () => ({
  communityService: {
    getAll: vi.fn(),
  },
}));

describe('Community Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderCommunity = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Community />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render page title', () => {
    vi.mocked(contentService.communityService.getAll).mockResolvedValue([]);
    renderCommunity();
    expect(screen.getByRole('heading', { name: /community/i })).toBeInTheDocument();
  });

  it('should display community links', async () => {
    const mockLinks = [
      {
        id: '1',
        platform: 'SKOOL',
        title: 'Skool Community',
        description: 'Join our Skool community',
        externalLink: 'https://skool.com',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    vi.mocked(contentService.communityService.getAll).mockResolvedValue(mockLinks as any);
    renderCommunity();

    await waitFor(() => {
      expect(screen.getByText('Skool Community')).toBeInTheDocument();
    });
  });
});


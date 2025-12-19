/**
 * Tools Page Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Tools from '../Tools';
import * as contentService from '../../services/api/contentService';

vi.mock('../../services/api/contentService', () => ({
  toolService: {
    getAll: vi.fn(),
  },
}));

describe('Tools Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderTools = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Tools />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render page title', () => {
    vi.mocked(contentService.toolService.getAll).mockResolvedValue([]);
    renderTools();
    expect(screen.getByRole('heading', { name: /tools?/i })).toBeInTheDocument();
  });

  it('should display tools when loaded', async () => {
    const mockTools = [
      {
        id: '1',
        title: 'Cursor',
        description: 'AI code editor',
        problemSolved: 'Faster coding',
        externalLink: 'https://cursor.sh',
        featured: false,
        isActive: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    vi.mocked(contentService.toolService.getAll).mockResolvedValue(mockTools as any);
    renderTools();

    await waitFor(() => {
      expect(screen.getByText('Cursor')).toBeInTheDocument();
    });
  });
});


/**
 * Admin Community Link Form Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommunityForm from '../CommunityForm';
import * as contentService from '../../../services/api/contentService';

vi.mock('../../../services/api/contentService', () => ({
  communityService: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
  }),
}));

describe('Admin Community Link Form', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const renderForm = (linkId?: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CommunityForm linkId={linkId} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render form fields for creating new community link', () => {
    renderForm();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/platform/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/external link/i)).toBeInTheDocument();
  });

  it('should populate form when editing existing link', async () => {
    const mockLink = {
      id: '1',
      title: 'Existing Link',
      description: 'Description',
      platform: 'SKOOL',
      externalLink: 'https://example.com',
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(contentService.communityService.getById).mockResolvedValue(mockLink as any);

    renderForm('1');

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Link')).toBeInTheDocument();
    });
  });
});


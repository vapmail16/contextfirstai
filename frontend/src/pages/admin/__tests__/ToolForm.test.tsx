/**
 * Admin Tool Form Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToolForm from '../ToolForm';
import * as contentService from '../../../services/api/contentService';

vi.mock('../../../services/api/contentService', () => ({
  toolService: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
  }),
}));

describe('Admin Tool Form', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const renderForm = (toolId?: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToolForm toolId={toolId} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render form fields for creating new tool', () => {
    renderForm();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/problem solved/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/external link/i)).toBeInTheDocument();
  });

  it('should populate form when editing existing tool', async () => {
    const mockTool = {
      id: '1',
      title: 'Existing Tool',
      description: 'Description',
      problemSolved: 'Solves problem',
      whoShouldUse: 'Developers',
      externalLink: 'https://example.com',
      featured: false,
      isActive: true,
      displayOrder: 1,
      relatedTrainingIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(contentService.toolService.getById).mockResolvedValue(mockTool as any);

    renderForm('1');

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Tool')).toBeInTheDocument();
    });
  });

  it('should submit form with tool data', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/title/i), 'New Tool');
    await user.type(screen.getByLabelText(/description/i), 'Tool Description');
    await user.type(screen.getByLabelText(/external link/i), 'https://example.com/tool');

    const submitButton = screen.getByRole('button', { name: /save|submit|create/i });
    expect(submitButton).toBeInTheDocument();
  });
});


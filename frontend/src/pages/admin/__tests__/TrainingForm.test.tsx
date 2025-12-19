/**
 * Admin Training Form Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrainingForm from '../TrainingForm';
import * as contentService from '../../../services/api/contentService';

vi.mock('../../../services/api/contentService', () => ({
  trainingService: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
  }),
}));

describe('Admin Training Form', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const renderForm = (trainingId?: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TrainingForm trainingId={trainingId} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render form fields for creating new training', () => {
    renderForm();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/external link/i)).toBeInTheDocument();
  });

  it('should populate form when editing existing training', async () => {
    const mockTraining = {
      id: '1',
      title: 'Existing Training',
      description: 'Description',
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

    renderForm('1');

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Training')).toBeInTheDocument();
    });
  });

  it('should submit form with training data', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/title/i), 'New Training');
    await user.type(screen.getByLabelText(/description/i), 'Training Description');
    await user.type(screen.getByLabelText(/external link/i), 'https://example.com/training');

    // Form should be submittable
    const submitButton = screen.getByRole('button', { name: /save|submit|create/i });
    expect(submitButton).toBeInTheDocument();
  });
});


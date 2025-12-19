/**
 * Training Form Image Upload Integration Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrainingForm from '../TrainingForm';
import axios from 'axios';

vi.mock('axios');
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
  }),
}));

describe('TrainingForm - Image Upload Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const renderForm = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TrainingForm />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render image upload component in form', () => {
    renderForm();

    expect(screen.getByLabelText(/upload.*image|image.*upload/i)).toBeInTheDocument();
  });

  it('should update image field when image is uploaded', async () => {
    const user = userEvent.setup();
    const mockUploadResponse = {
      data: {
        success: true,
        data: {
          url: '/uploads/test-image.jpg',
          filename: 'test-image.jpg',
        },
      },
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockUploadResponse);

    renderForm();

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload.*image|image.*upload/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/upload/image'),
        expect.any(FormData),
        expect.any(Object)
      );
    });
  });
});


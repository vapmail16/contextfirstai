/**
 * Image Upload Component Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUpload from '../ImageUpload';
import axios from 'axios';

vi.mock('axios');

describe('ImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render file input', () => {
    render(<ImageUpload onUploadComplete={vi.fn()} />);

    expect(screen.getByLabelText(/upload|image|file/i)).toBeInTheDocument();
  });

  it('should upload image file and call onUploadComplete', async () => {
    const user = userEvent.setup();
    const onUploadComplete = vi.fn();
    const mockResponse = {
      data: {
        success: true,
        data: {
          url: '/uploads/test.jpg',
          filename: 'test.jpg',
        },
      },
    };

    vi.mocked(axios.post).mockResolvedValue(mockResponse);

    render(<ImageUpload onUploadComplete={onUploadComplete} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload|image|file/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(onUploadComplete).toHaveBeenCalledWith(mockResponse.data.data);
    });
  });

  it('should display error message on upload failure', async () => {
    const user = userEvent.setup();
    vi.mocked(axios.post).mockRejectedValue(new Error('Upload failed'));

    render(<ImageUpload onUploadComplete={vi.fn()} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload|image|file/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });
});


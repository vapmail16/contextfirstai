/**
 * Login Page Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../Login';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login Page', () => {
  let queryClient: QueryClient;
  const mockLogin = vi.fn();
  const mockUseAuth = {
    login: mockLogin,
    isLoading: false,
    isAuthenticated: false,
  };

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockUseAuth as any);
  });

  const renderLogin = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render login form', () => {
    renderLogin();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should submit login form with email and password', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrong-password');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid|error|failed/i)).toBeInTheDocument();
    });
  });
});


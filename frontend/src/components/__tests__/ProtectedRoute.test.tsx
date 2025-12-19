/**
 * Protected Route Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const renderProtectedRoute = (isAuthenticated: boolean, requiredRole?: string) => {
    const mockUser = isAuthenticated
      ? { id: '1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN', isActive: true }
      : null;

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated,
      user: mockUser,
      isLoading: false, // Set to false so component doesn't show loading
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
    } as any);

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute requiredRole={requiredRole}>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render children when authenticated', () => {
    renderProtectedRoute(true);

    // When authenticated, children should be rendered immediately
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when not authenticated', () => {
    renderProtectedRoute(false);

    // When not authenticated, Navigate component is rendered instead
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should check role when requiredRole is provided and user has correct role', () => {
    renderProtectedRoute(true, 'ADMIN');

    // When authenticated with correct role, children should be rendered
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should deny access when user role does not match requiredRole', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'user@test.com', name: 'User', role: 'USER', isActive: true },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProtectedRoute requiredRole="ADMIN">
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
    
    const accessDeniedText = screen.getByText(/access denied/i);
    expect(accessDeniedText).toBeInTheDocument();
  });
});


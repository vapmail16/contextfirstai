/**
 * Auth Context Tests
 * TDD Approach: Write tests first (RED phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authService from '../../services/api/authService';

vi.mock('../../services/api/authService', () => {
  const mockApi = {
    interceptors: {
      response: {
        use: vi.fn(() => 1),
        eject: vi.fn(),
      },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
    post: vi.fn(),
    get: vi.fn(),
  };

  return {
    api: mockApi,
    authService: {
      api: mockApi,
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshToken: vi.fn(),
    },
  };
});

describe('AuthContext', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  describe('Initial State', () => {
    it('should have null user initially', async () => {
      vi.mocked(authService.authService.getCurrentUser).mockRejectedValue(
        new Error('Not authenticated')
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('Login', () => {
    it('should login user and set token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        isActive: true,
      };

      const mockResponse = {
        user: mockUser,
        accessToken: 'test-token',
      };

      vi.mocked(authService.authService.login).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
        expect(localStorage.getItem('accessToken')).toBe('test-token');
      });
    });

    it('should handle login errors', async () => {
      vi.mocked(authService.authService.login).mockRejectedValue(
        new Error('Invalid credentials')
      );
      vi.mocked(authService.authService.getCurrentUser).mockRejectedValue(
        new Error('Not authenticated')
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong-password');
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('Logout', () => {
    it('should logout user and clear token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        isActive: true,
      };

      vi.mocked(authService.authService.login).mockResolvedValue({
        user: mockUser,
        accessToken: 'test-token',
      });
      vi.mocked(authService.authService.logout).mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(localStorage.getItem('accessToken')).toBeNull();
      });
    });
  });
});


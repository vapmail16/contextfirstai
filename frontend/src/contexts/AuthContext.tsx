/**
 * Auth Context
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, User, LoginData, RegisterData, api } from '../services/api/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getCurrentUser,
    enabled: !!accessToken,
    retry: false,
    refetchOnWindowFocus: false, // Prevent automatic refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if we have cached data
    onError: (error: any) => {
      // If getCurrentUser fails with 401, clear token (refresh will be attempted by interceptor)
      // If refresh also fails, tokens will be cleared by interceptor
      if (error?.response?.status === 401) {
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        queryClient.setQueryData(['auth', 'me'], null);
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
    onError: (error) => {
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      throw error; // Re-throw so component can handle it
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: () => {
      // After registration, user needs to login
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    },
  });

  // Refresh token
  const refreshMutation = useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
    },
    onError: () => {
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      queryClient.setQueryData(['auth', 'me'], null);
    },
  });

  // Set up axios interceptor for token refresh
  useEffect(() => {
    if (!api?.interceptors?.response) return;

    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loop: don't retry refresh endpoint itself
        if (originalRequest.url?.includes('/auth/refresh')) {
          // If refresh fails, clear tokens and reject
          setAccessToken(null);
          localStorage.removeItem('accessToken');
          queryClient.setQueryData(['auth', 'me'], null);
          return Promise.reject(error);
        }

        // Only retry if it's a 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const { accessToken: newToken } = await refreshMutation.mutateAsync();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear everything and reject
            setAccessToken(null);
            localStorage.removeItem('accessToken');
            queryClient.setQueryData(['auth', 'me'], null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      if (api?.interceptors?.response) {
        api.interceptors.response.eject(interceptor);
      }
    };
  }, [refreshMutation, queryClient]);

  // Set authorization header when token changes
  useEffect(() => {
    if (!api?.defaults?.headers) return;

    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated: !!user && !!accessToken,
    isLoading: isLoadingUser,
    login: async (email: string, password: string) => {
      try {
        await loginMutation.mutateAsync({ email, password });
      } catch (error) {
        // Error is already handled in onError, but we re-throw for component handling
        throw error;
      }
    },
    register: async (data: RegisterData) => {
      await registerMutation.mutateAsync(data);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refreshAuth: async () => {
      await refreshMutation.mutateAsync();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


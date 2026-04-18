"use client";

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import { AuthService } from '@/lib/auth-service';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@/types/api';
import { toast } from 'sonner';

// Auth API calls
const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await ApiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    return response;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await ApiClient.post<AuthResponse>('/auth/register', data);
    return response;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await ApiClient.get<User>('/auth/me');
    return response;
  },
};

// Login hook
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await AuthService.saveAuthResponse(data);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Login failed. Please try again.');
    },
  });
};

// Register hook
export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      await AuthService.saveAuthResponse(data);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Registration failed. Please try again.');
    },
  });
};

// Logout hook
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await AuthService.logout();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/auth');
      toast.success('Logged out successfully');
    },
  });
};

// Current user hook
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: false, // Will be enabled manually after checking auth
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Check if user is authenticated (async version)
export const useIsAuthenticated = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AuthService.isAuthenticated().then((result) => {
      setIsAuth(result);
      setIsLoading(false);
    });
  }, []);

  return { isAuthenticated: isAuth, isLoading };
};

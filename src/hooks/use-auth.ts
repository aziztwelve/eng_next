"use client";

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import { AuthService, AUTH_CHANGED_EVENT } from '@/lib/auth-service';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@/types/api';
import { toast } from 'sonner';

/**
 * Берёт `?redirect=` из URL и проверяет, что это безопасный относительный
 * путь (защита от open-redirect: внешние URL и `//host` запрещены).
 */
function safeRedirect(raw: string | null): string | null {
  if (!raw) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  // Только относительные пути, начинающиеся с `/`, но не с `//` (protocol-relative).
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return null;
  // Не редиректим обратно в /auth, иначе зациклится.
  if (decoded === '/auth' || decoded.startsWith('/auth/') || decoded.startsWith('/auth?')) {
    return null;
  }
  return decoded;
}

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
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await AuthService.saveAuthResponse(data);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Welcome back!');
      const redirect = safeRedirect(searchParams.get('redirect'));
      router.push(redirect ?? '/dashboard');
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
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      await AuthService.saveAuthResponse(data);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Account created successfully!');
      const redirect = safeRedirect(searchParams.get('redirect'));
      router.push(redirect ?? '/dashboard');
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

/**
 * Реактивная проверка auth-состояния. Перечитывает токен из localStorage:
 *   1. при mount'е (initial loading);
 *   2. на кастомный `auth-changed` event (login/logout в этой же вкладке);
 *   3. на `storage` event (login/logout в другой вкладке).
 *
 * Это критично: AuthGuard живёт в RootLayout и переживает client-side
 * навигацию, поэтому без подписки он застрянет со state'ом «не залогинен»
 * после успешного логина → редирект-цикл на /auth.
 */
export const useIsAuthenticated = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = () => {
      AuthService.isAuthenticated().then((result) => {
        if (cancelled) return;
        setIsAuth(result);
        setIsLoading(false);
      });
    };

    check();

    const onChange = () => check();
    window.addEventListener(AUTH_CHANGED_EVENT, onChange);
    window.addEventListener('storage', onChange);

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return { isAuthenticated: isAuth, isLoading };
};

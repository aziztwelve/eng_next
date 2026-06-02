"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { OnboardingApi } from '@/lib/onboarding/api';
import type {
  OnboardingState,
  PatchOnboardingRequest,
} from '@/types/onboarding';
import { useIsAuthenticated } from '@/hooks/use-auth';

const QUERY_KEY = ['onboarding', 'state'] as const;

/**
 * Загружает текущий backend-стейт онбординга. Авто-disabled пока нет
 * никакой сессии (даже guest-bootstrap ещё не отработал).
 */
export function useOnboardingState() {
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();

  return useQuery<OnboardingState>({
    queryKey: QUERY_KEY,
    queryFn: OnboardingApi.getState,
    enabled: isAuthenticated && !authLoading,
    staleTime: 30 * 1000,
    retry: 1,
  });
}

/**
 * Удобная мутация: PATCH одного или нескольких полей. Optimistically
 * мерджит payload в кеш до ответа — UX мгновенный.
 */
export function usePatchOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: PatchOnboardingRequest) => OnboardingApi.patchState(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const prev = queryClient.getQueryData<OnboardingState>(QUERY_KEY);
      if (prev) {
        queryClient.setQueryData<OnboardingState>(QUERY_KEY, {
          ...prev,
          ...patch,
          motivation: patch.motivation ?? prev.motivation,
        });
      }
      return { prev };
    },
    onError: (err, _patch, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(QUERY_KEY, ctx.prev);
      const msg = err instanceof Error ? err.message : 'Не удалось сохранить ответ';
      toast.error(msg);
    },
    onSuccess: (state) => {
      queryClient.setQueryData(QUERY_KEY, state);
    },
  });
}

/**
 * POST /onboarding/complete. Используется на финале после signup'а.
 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => OnboardingApi.complete(),
    onSuccess: (state) => {
      queryClient.setQueryData(QUERY_KEY, state);
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Не удалось завершить онбординг';
      toast.error(msg);
    },
  });
}

/**
 * Combo-helper, который большинство шагов использует.
 *
 * Возвращает state + isLoading + одну `patchState` функцию. Не дублирует
 * `useOnboardingState` + `usePatchOnboarding` для каждого шага.
 */
export function useOnboarding() {
  const stateQ = useOnboardingState();
  const patchM = usePatchOnboarding();
  return {
    state: stateQ.data,
    isLoading: stateQ.isLoading,
    isError: stateQ.isError,
    error: stateQ.error,
    patchState: patchM.mutateAsync,
    isPending: patchM.isPending,
    refetch: stateQ.refetch,
  };
}

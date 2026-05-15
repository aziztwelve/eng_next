'use client';

import { useQuery } from '@tanstack/react-query';
import { GamificationApi } from '@/lib/gamification-api';
import { useIsAuthenticated } from '@/hooks/use-auth';

export const USER_STATS_KEY = ['user-stats'] as const;

/** Текущий пользователь — кэшируем 30s, авто-рефетч по фокусу. */
export function useUserStats() {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: USER_STATS_KEY,
    queryFn: () => GamificationApi.getMyStats(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

/** Stats произвольного пользователя (профиль другого человека). */
export function useUserStatsById(userId: string) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => GamificationApi.getUserStats(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

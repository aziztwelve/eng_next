'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GamificationApi } from '@/lib/gamification-api';
import { useIsAuthenticated } from '@/hooks/use-auth';
import { USER_STATS_KEY } from '@/hooks/use-user-stats';
import { toast } from 'sonner';

export function streakHistoryKey(days: number) {
  return ['streak-history', days] as const;
}

export function useStreakHistory(days = 30) {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: streakHistoryKey(days),
    queryFn: () => GamificationApi.getStreakHistory(days),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useUseFreeze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => GamificationApi.consumeStreakFreeze(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['streak-history'] });
      qc.invalidateQueries({ queryKey: USER_STATS_KEY });
      toast.success('Streak freeze активирован');
    },
    onError: (e: { message?: string }) => {
      toast.error(e?.message ?? 'Не удалось активировать freeze');
    },
  });
}

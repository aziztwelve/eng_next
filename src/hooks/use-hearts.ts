'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GamificationApi } from '@/lib/gamification-api';
import { useIsAuthenticated } from '@/hooks/use-auth';
import { USER_STATS_KEY } from '@/hooks/use-user-stats';
import { toast } from 'sonner';
import type { RefillReason } from '@/types/api';

export const HEARTS_KEY = ['hearts'] as const;

export function useHearts() {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: HEARTS_KEY,
    queryFn: () => GamificationApi.getHearts(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    // Раз в минуту обновляем — таймер регенерации идет на бэке.
    refetchInterval: 60 * 1000,
  });
}

export function useRefillHearts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reason, amount }: { reason?: RefillReason; amount?: number } = {}) =>
      GamificationApi.refillHearts(reason, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HEARTS_KEY });
      qc.invalidateQueries({ queryKey: USER_STATS_KEY });
      toast.success('Жизни восстановлены');
    },
    onError: (e: { message?: string }) => {
      toast.error(e?.message ?? 'Не удалось восстановить жизни');
    },
  });
}

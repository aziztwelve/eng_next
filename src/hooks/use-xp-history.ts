'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { GamificationApi } from '@/lib/gamification-api';
import { useIsAuthenticated } from '@/hooks/use-auth';

const PAGE_SIZE = 20;

/** Простой список (для виджетов на дашборде). */
export function useXPHistory(limit = 20) {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: ['xp-history', limit],
    queryFn: () => GamificationApi.getXPHistory(limit, 0),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

/** Пагинация для страницы статистики. */
export function useXPHistoryInfinite(pageSize = PAGE_SIZE) {
  const { isAuthenticated } = useIsAuthenticated();
  return useInfiniteQuery({
    queryKey: ['xp-history-infinite', pageSize],
    enabled: isAuthenticated,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      GamificationApi.getXPHistory(pageSize, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.transactions.length, 0);
      if (loaded >= lastPage.total) return undefined;
      return loaded;
    },
    staleTime: 30 * 1000,
  });
}

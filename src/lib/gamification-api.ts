import { ApiClient } from '@/lib/api-client';
import type {
  Achievement,
  AchievementsResponse,
  DailyGoal,
  Hearts,
  ProtoTimestamp,
  RefillReason,
  Streak,
  StreakHistory,
  UserAchievementsResponse,
  UserStats,
  XPHistoryResponse,
} from '@/types/api';

/**
 * Нормализует proto-timestamp (`{seconds, nanos}` или RFC3339 string)
 * в JS `Date | null`.
 */
export function tsToDate(ts: ProtoTimestamp): Date | null {
  if (ts == null) return null;
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof ts === 'object') {
    const sec = typeof ts.seconds === 'string' ? Number(ts.seconds) : ts.seconds ?? 0;
    if (!sec) return null;
    return new Date(sec * 1000);
  }
  return null;
}

export const GamificationApi = {
  // Stats
  getMyStats: () => ApiClient.get<UserStats>('/gamification/stats'),
  getUserStats: (userId: string) =>
    ApiClient.get<UserStats>(`/gamification/stats/${encodeURIComponent(userId)}`),

  // Hearts
  getHearts: () => ApiClient.get<Hearts>('/gamification/hearts'),
  refillHearts: (reason?: RefillReason, amount?: number) =>
    ApiClient.post<Hearts>('/gamification/hearts/refill', {
      reason: reason ?? 'gems',
      amount: amount ?? 0,
    }),

  // Daily goal
  getDailyGoal: () => ApiClient.get<DailyGoal>('/gamification/daily-goal'),
  updateDailyGoal: (target_xp: number) =>
    ApiClient.put<DailyGoal>('/gamification/daily-goal', { target_xp }),

  // Streak
  getStreakHistory: (days = 30) =>
    ApiClient.get<StreakHistory>(`/gamification/streak/history?days=${days}`),
  consumeStreakFreeze: () => ApiClient.post<Streak>('/gamification/streak/freeze'),

  // Achievements
  listAchievements: (params?: { category?: string; include_hidden?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.include_hidden) q.append('include_hidden', 'true');
    const s = q.toString();
    return ApiClient.get<AchievementsResponse>(`/gamification/achievements${s ? `?${s}` : ''}`);
  },
  getMyAchievements: () =>
    ApiClient.get<UserAchievementsResponse>('/gamification/achievements/mine'),

  // XP history
  getXPHistory: (limit = 50, offset = 0) =>
    ApiClient.get<XPHistoryResponse>(
      `/gamification/xp/history?limit=${limit}&offset=${offset}`,
    ),
};

export type { Achievement, UserStats, Hearts, DailyGoal, Streak, StreakHistory };

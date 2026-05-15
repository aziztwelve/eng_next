'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GamificationApi } from '@/lib/gamification-api';
import { USER_STATS_KEY } from '@/hooks/use-user-stats';
import { HEARTS_KEY } from '@/hooks/use-hearts';
import { DAILY_GOAL_KEY } from '@/hooks/use-daily-goal';
import {
  showAchievementToasts,
  showDailyGoalToast,
  showLevelUpToast,
  showXPGainToast,
} from '@/components/gamification';
import type {
  AddXPResponse,
  DailyGoal,
  UserAchievement,
  UserAchievementsResponse,
  UserStats,
} from '@/types/api';

/**
 * После завершения шага/урока запускаем геймификационные эффекты.
 *
 * Два режима:
 *
 * 1. **Inline-payload (preferred)** — когда `complete-step` уже вернул
 *    `gamification: AddXPResponse`, передаем его сюда. В этом случае
 *    точно знаем `transaction.amount` (XP за этот конкретный шаг),
 *    `leveled_up`, `unlocked_achievements`, `daily_goal_progress` —
 *    обновляем кэш и сразу триггерим тосты.
 *
 * 2. **Fallback (diff)** — если payload'а нет (course-service не настроен
 *    на gamification-service), снимаем "до"-снимок stats / my-achievements /
 *    daily-goal из кэша, перезапрашиваем и диффим. Менее точно (XP считаем
 *    по разнице total_xp), но работает без backend-сцепки.
 */
export function useLessonGamificationFx() {
  const qc = useQueryClient();

  return useCallback(
    async (xp?: AddXPResponse | null) => {
      if (xp) {
        // === Inline-payload путь ===
        if (xp.stats) qc.setQueryData(USER_STATS_KEY, xp.stats);
        if (xp.daily_goal_progress) {
          // Перезапросим целиком DailyGoal, т.к. payload содержит только today.
          GamificationApi.getDailyGoal()
            .then((goal) => qc.setQueryData(DAILY_GOAL_KEY, goal))
            .catch(() => undefined);
        }
        // Обновляем my-achievements: добавляем unlocked'ы в кэш, если их там нет.
        const newAchievements = xp.unlocked_achievements ?? [];
        if (newAchievements.length) {
          const cur =
            qc.getQueryData<UserAchievementsResponse>(['my-achievements'])?.achievements ?? [];
          const haveIds = new Set(cur.map((ua) => ua.achievement?.id));
          const merged = [
            ...cur,
            ...newAchievements.filter((ua) => !haveIds.has(ua.achievement?.id)),
          ];
          qc.setQueryData<UserAchievementsResponse>(['my-achievements'], {
            achievements: merged,
          });
        }
        qc.invalidateQueries({ queryKey: HEARTS_KEY });
        qc.invalidateQueries({ queryKey: ['xp-history'] });
        qc.invalidateQueries({ queryKey: ['xp-history-infinite'] });

        // Тосты.
        const amount = xp.transaction?.amount ?? 0;
        if (amount > 0) showXPGainToast(amount);
        if (xp.leveled_up) showLevelUpToast(xp.new_level);
        if (newAchievements.length) showAchievementToasts(newAchievements);
        if (xp.daily_goal_progress?.completed) {
          // Триггерим только если до этого было НЕ completed.
          const beforeGoal = qc.getQueryData<DailyGoal>(DAILY_GOAL_KEY);
          if (!(beforeGoal?.today?.completed ?? false)) showDailyGoalToast();
        }
        return;
      }

      // === Diff fallback ===
      const beforeStats = qc.getQueryData<UserStats>(USER_STATS_KEY);
      const beforeMine = qc.getQueryData<UserAchievementsResponse>(['my-achievements']);
      const beforeGoal = qc.getQueryData<DailyGoal>(DAILY_GOAL_KEY);
      const beforeOwned = new Set<string>(
        beforeMine?.achievements?.map((ua) => ua.achievement?.id).filter(Boolean) as string[],
      );

      const [afterStats, afterMine, afterGoal] = await Promise.all([
        GamificationApi.getMyStats().catch(() => null),
        GamificationApi.getMyAchievements().catch(() => null),
        GamificationApi.getDailyGoal().catch(() => null),
      ]);

      if (afterStats) qc.setQueryData(USER_STATS_KEY, afterStats);
      if (afterMine) qc.setQueryData(['my-achievements'], afterMine);
      if (afterGoal) qc.setQueryData(DAILY_GOAL_KEY, afterGoal);
      qc.invalidateQueries({ queryKey: HEARTS_KEY });
      qc.invalidateQueries({ queryKey: ['xp-history'] });
      qc.invalidateQueries({ queryKey: ['xp-history-infinite'] });

      if (afterStats && beforeStats) {
        const delta = afterStats.total_xp - beforeStats.total_xp;
        if (delta > 0) showXPGainToast(delta);
        if (afterStats.level > beforeStats.level) {
          showLevelUpToast(afterStats.level);
        }
      } else if (afterStats && !beforeStats && afterStats.total_xp > 0) {
        showXPGainToast(afterStats.total_xp);
      }

      if (afterMine?.achievements?.length) {
        const newOnes: UserAchievement[] = afterMine.achievements.filter(
          (ua) => ua.achievement?.id && !beforeOwned.has(ua.achievement.id),
        );
        if (newOnes.length) showAchievementToasts(newOnes);
      }

      if (
        afterGoal?.today?.completed &&
        !(beforeGoal?.today?.completed ?? false)
      ) {
        showDailyGoalToast();
      }
    },
    [qc],
  );
}

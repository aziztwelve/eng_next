'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserStats } from '@/hooks/use-user-stats';
import { useDailyGoal, useUpdateDailyGoal } from '@/hooks/use-daily-goal';
import { useXPHistoryInfinite } from '@/hooks/use-xp-history';
import { DailyGoalRing, XPBar } from '@/components/gamification';
import { tsToDate } from '@/lib/gamification-api';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { XPTransaction } from '@/types/api';

const GOAL_PRESETS = [10, 20, 30, 50];

const REASON_LABEL: Record<string, string> = {
  XP_REASON_STEP_COMPLETED: 'Step',
  XP_REASON_LESSON_COMPLETED: 'Lesson',
  XP_REASON_DAILY_GOAL: 'Daily goal',
  XP_REASON_ACHIEVEMENT: 'Achievement',
  XP_REASON_STREAK_BONUS: 'Streak bonus',
  XP_REASON_PRACTICE: 'Practice',
};

const REASON_NUMERIC: Record<number, string> = {
  1: 'Step',
  2: 'Lesson',
  3: 'Daily goal',
  4: 'Achievement',
  5: 'Streak bonus',
  6: 'Practice',
};

function reasonLabel(r: XPTransaction['reason']): string {
  if (typeof r === 'number') return REASON_NUMERIC[r] ?? '—';
  return REASON_LABEL[r] ?? '—';
}

export default function StatsPage() {
  const { t } = useLanguage();
  const { data: stats } = useUserStats();
  const { data: goal } = useDailyGoal();
  const updateGoal = useUpdateDailyGoal();
  const xp = useXPHistoryInfinite();

  const transactions = useMemo(
    () => xp.data?.pages?.flatMap((p) => p.transactions) ?? [],
    [xp.data],
  );

  // Группируем XP по дням за последние 14 дней.
  const byDay = useMemo(() => {
    const m = new Map<string, number>();
    transactions.forEach((tx) => {
      const d = tsToDate(tx.created_at);
      if (!d) return;
      const iso = d.toISOString().slice(0, 10);
      m.set(iso, (m.get(iso) ?? 0) + tx.amount);
    });
    const out: Array<{ date: string; xp: number }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      out.push({ date: iso, xp: m.get(iso) ?? 0 });
    }
    return out;
  }, [transactions]);

  const maxBar = Math.max(10, ...byDay.map((d) => d.xp));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Button asChild variant="ghost" className="rounded-xl font-bold w-fit">
        <Link href="/profile">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Link>
      </Button>
      <h1 className="text-3xl sm:text-4xl font-black">{t('common.stats')}</h1>

      <Card className="rounded-3xl border-4 p-6 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <DailyGoalRing size={120} />
        <div className="space-y-3 w-full">
          <h2 className="font-black text-lg">{t('common.dailyGoal')}</h2>
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map((target) => (
              <Button
                key={target}
                onClick={() => updateGoal.mutate(target)}
                disabled={updateGoal.isPending}
                variant={goal?.target_xp === target ? 'default' : 'outline'}
                className="rounded-xl font-bold"
              >
                {target} XP
              </Button>
            ))}
          </div>
          <XPBar />
        </div>
      </Card>

      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <h2 className="font-black text-lg">XP за 14 дней</h2>
        <div className="flex items-end justify-between gap-1 h-32">
          {byDay.map((d) => {
            const pct = (d.xp / maxBar) * 100;
            const day = new Date(d.date).getDate();
            return (
              <div key={d.date} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={cn(
                    'w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-300 min-h-[2px] transition-all',
                    d.xp === 0 && 'bg-muted from-muted to-muted/60',
                  )}
                  style={{ height: `${pct}%` }}
                  title={`${d.date}: ${d.xp} XP`}
                />
                <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Total: {stats?.total_xp ?? 0} XP</span>
          <span>Weekly: {stats?.weekly_xp ?? 0} XP</span>
        </div>
      </Card>

      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <h2 className="font-black text-lg">XP история</h2>
        {transactions.length === 0 && !xp.isLoading ? (
          <p className="text-muted-foreground font-medium">Пока нет транзакций.</p>
        ) : (
          <ul className="divide-y">
            {transactions.map((tx) => {
              const d = tsToDate(tx.created_at);
              return (
                <li key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Zap className="h-4 w-4 text-amber-500 fill-current flex-shrink-0" />
                    <span className="font-bold text-sm truncate">{reasonLabel(tx.reason)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground tabular-nums">
                      {d ? d.toLocaleDateString() : '—'}
                    </span>
                    <span className="font-black text-amber-600 tabular-nums">+{tx.amount}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {xp.hasNextPage && (
          <Button
            onClick={() => xp.fetchNextPage()}
            disabled={xp.isFetchingNextPage}
            variant="outline"
            className="rounded-xl border-2 font-bold w-full"
          >
            {xp.isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Загрузить ещё'
            )}
          </Button>
        )}
      </Card>
    </div>
  );
}

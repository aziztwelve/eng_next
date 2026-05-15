'use client';

import { useMemo } from 'react';
import { Loader2, Snowflake } from 'lucide-react';
import { useStreakHistory } from '@/hooks/use-streak';
import { cn } from '@/lib/utils';
import type { StreakDay } from '@/types/api';

export interface StreakCalendarProps {
  days?: number;
  className?: string;
}

/**
 * Сетка последних N дней. Цвет: completed=primary, freeze=cyan, miss=muted.
 */
export function StreakCalendar({ days = 30, className }: StreakCalendarProps) {
  const { data, isLoading } = useStreakHistory(days);

  const map = useMemo(() => {
    const m = new Map<string, StreakDay>();
    data?.days?.forEach((d) => m.set(d.date, d));
    return m;
  }, [data]);

  // Генерируем последние `days` дней (включая сегодня).
  const dates = useMemo(() => {
    const out: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      out.push(iso);
    }
    return out;
  }, [days]);

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-7 gap-1.5', className)}>
      {dates.map((iso) => {
        const day = map.get(iso);
        const date = new Date(iso);
        const dayNum = date.getDate();
        const isToday = iso === new Date().toISOString().slice(0, 10);

        let style = 'bg-muted text-muted-foreground';
        if (day?.completed) {
          style = day.used_freeze
            ? 'bg-cyan-500 text-white'
            : 'bg-emerald-500 text-white shadow-[0_2px_0_0_#047857]';
        }

        return (
          <div
            key={iso}
            title={`${iso}${day?.completed ? ' · completed' : ''}${day?.used_freeze ? ' · freeze' : ''}`}
            className={cn(
              'aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs font-black tabular-nums',
              style,
              isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
            )}
          >
            {day?.used_freeze ? <Snowflake className="h-3 w-3" /> : <span>{dayNum}</span>}
          </div>
        );
      })}
    </div>
  );
}

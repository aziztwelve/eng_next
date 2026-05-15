'use client';

import { useUserStats } from '@/hooks/use-user-stats';
import { cn } from '@/lib/utils';
import type { UserStats } from '@/types/api';

export interface XPBarProps {
  /** Подменить данные (например, в lesson flow с локальной анимацией). */
  stats?: Pick<UserStats, 'level' | 'total_xp' | 'next_level_xp'>;
  showLabels?: boolean;
  className?: string;
}

/** Прогресс к следующему уровню на основе total_xp / next_level_xp. */
export function XPBar({ stats, showLabels = true, className }: XPBarProps) {
  const { data } = useUserStats();
  const s = stats ?? data;

  if (!s) {
    return <div className={cn('h-2 w-full bg-muted rounded-full', className)} />;
  }

  // next_level_xp — total XP, нужный для следующего уровня.
  // Считаем порог текущего уровня по формуле 100·L·(L-1)/2.
  const currentThreshold = (100 * s.level * (s.level - 1)) / 2;
  const span = Math.max(1, s.next_level_xp - currentThreshold);
  const into = Math.max(0, s.total_xp - currentThreshold);
  const pct = Math.min(100, Math.round((into / span) * 100));

  return (
    <div className={cn('flex flex-col gap-1 min-w-[120px]', className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-bold tabular-nums">
          <span className="text-foreground/80">Lv {s.level}</span>
          <span className="text-muted-foreground">
            {into} / {span} XP
          </span>
        </div>
      )}
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden border border-border/40">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

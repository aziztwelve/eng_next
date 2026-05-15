'use client';

import { Star } from 'lucide-react';
import { useUserStats } from '@/hooks/use-user-stats';
import { cn } from '@/lib/utils';

export interface LevelBadgeProps {
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const { data } = useUserStats();
  const lvl = level ?? data?.level ?? 1;

  const sizeClass =
    size === 'sm' ? 'h-7 px-2 text-xs' : size === 'lg' ? 'h-12 px-4 text-base' : 'h-9 px-3 text-sm';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 border-amber-400/60 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-black uppercase tracking-tight',
        sizeClass,
        className,
      )}
      title={`Level ${lvl}`}
    >
      <Star className={cn('fill-current', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      Lv {lvl}
    </div>
  );
}

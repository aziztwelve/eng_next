'use client';

import { Flame } from 'lucide-react';
import { useUserStats } from '@/hooks/use-user-stats';
import { cn } from '@/lib/utils';

export interface StreakBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StreakBadge({ size = 'md', className }: StreakBadgeProps) {
  const { data } = useUserStats();
  const streak = data?.current_streak ?? 0;
  const active = streak > 0;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 font-bold tabular-nums',
        active ? 'text-orange-500' : 'text-muted-foreground',
        className,
      )}
      title={
        active
          ? `Streak ${streak} ${streak === 1 ? 'day' : 'days'}`
          : 'No active streak'
      }
    >
      <Flame
        className={cn(
          active && 'fill-current',
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5',
        )}
      />
      <span className={cn(size === 'lg' && 'text-lg')}>{streak}</span>
    </div>
  );
}

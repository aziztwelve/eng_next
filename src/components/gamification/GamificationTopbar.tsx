'use client';

import { HeartCounter } from './HeartCounter';
import { StreakBadge } from './StreakBadge';
import { XPBar } from './XPBar';
import { LevelBadge } from './LevelBadge';
import { cn } from '@/lib/utils';

export interface GamificationTopbarProps {
  /**
   * compact=true рендерим только StreakBadge + HeartCounter (для мобильной шапки).
   */
  compact?: boolean;
  className?: string;
}

export function GamificationTopbar({ compact = false, className }: GamificationTopbarProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <StreakBadge size="sm" />
        <HeartCounter size="sm" showTimer={false} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <StreakBadge />
      <HeartCounter />
      <div className="hidden lg:flex items-center gap-3">
        <LevelBadge size="sm" />
        <XPBar className="w-32" showLabels={false} />
      </div>
    </div>
  );
}

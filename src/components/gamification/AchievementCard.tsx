'use client';

import { Award, Lock } from 'lucide-react';
import type { Achievement, UserAchievement } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { tsToDate } from '@/lib/gamification-api';

const TIER_LABEL: Record<number, string> = { 1: 'bronze', 2: 'silver', 3: 'gold' };

const TIER_STYLES: Record<number, string> = {
  1: 'border-amber-700/60 bg-amber-50 dark:bg-amber-900/20',
  2: 'border-slate-400/60 bg-slate-50 dark:bg-slate-800/30',
  3: 'border-yellow-400/60 bg-yellow-50 dark:bg-yellow-500/10',
};

const TIER_TEXT: Record<number, string> = {
  1: 'text-amber-800 dark:text-amber-200',
  2: 'text-slate-700 dark:text-slate-200',
  3: 'text-yellow-700 dark:text-yellow-300',
};

export interface AchievementCardProps {
  achievement: Achievement;
  /** Если передан — карточка считается unlocked. */
  user?: UserAchievement | null;
  className?: string;
}

export function AchievementCard({ achievement: a, user, className }: AchievementCardProps) {
  const unlocked = !!user;
  const unlockedAt = user ? tsToDate(user.unlocked_at) : null;

  return (
    <Card
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-3xl border-4 p-4 text-center transition',
        unlocked ? TIER_STYLES[a.tier] ?? TIER_STYLES[1] : 'bg-muted/30 border-border/60 opacity-70',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-2xl border-4',
          unlocked ? 'bg-background' : 'bg-muted',
        )}
      >
        {unlocked && a.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.icon_url} alt={a.title} className="h-12 w-12 object-contain" />
        ) : unlocked ? (
          <Award className={cn('h-9 w-9', TIER_TEXT[a.tier] ?? TIER_TEXT[1])} />
        ) : (
          <Lock className="h-7 w-7 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1 w-full">
        <h3 className={cn('text-sm font-black leading-tight', !unlocked && 'text-muted-foreground')}>
          {a.title}
        </h3>
        <p className="text-xs font-medium text-muted-foreground line-clamp-2 leading-snug">
          {a.description}
        </p>
      </div>
      <div className="flex items-center gap-1.5 mt-auto pt-1 flex-wrap justify-center">
        <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold border-2">
          {TIER_LABEL[a.tier] ?? 'tier'}
        </Badge>
        <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold border-2">
          {a.category}
        </Badge>
        {a.xp_reward > 0 && (
          <Badge variant="outline" className="rounded-full text-[10px] font-bold border-2">
            +{a.xp_reward} XP
          </Badge>
        )}
      </div>
      {unlockedAt && (
        <p className="text-[10px] text-muted-foreground font-medium tabular-nums">
          {unlockedAt.toLocaleDateString()}
        </p>
      )}
    </Card>
  );
}

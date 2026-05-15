'use client';

import { Target } from 'lucide-react';
import { useDailyGoal } from '@/hooks/use-daily-goal';
import { cn } from '@/lib/utils';

export interface DailyGoalRingProps {
  size?: number; // px
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

/**
 * SVG-кольцо прогресса дневной цели на основе `today.xp_earned / goal`.
 * Если goal=0 — рисуем "плоское" кольцо.
 */
export function DailyGoalRing({
  size = 96,
  strokeWidth = 10,
  showLabel = true,
  className,
}: DailyGoalRingProps) {
  const { data } = useDailyGoal();
  const goal = data?.target_xp ?? data?.today?.goal ?? 20;
  const earned = data?.today?.xp_earned ?? 0;
  const completed = data?.today?.completed ?? false;
  const pct = goal > 0 ? Math.min(100, Math.round((earned / goal) * 100)) : 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn(
            'transition-[stroke-dashoffset] duration-700',
            completed ? 'text-emerald-500' : 'text-primary',
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {completed ? (
          <span className="text-2xl">✅</span>
        ) : (
          <Target className="h-5 w-5 text-primary" />
        )}
        {showLabel && (
          <div className="text-center mt-0.5">
            <div className="text-sm font-black tabular-nums leading-none">
              {earned}/{goal}
            </div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
              XP
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

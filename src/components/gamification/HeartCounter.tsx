'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useHearts } from '@/hooks/use-hearts';
import { tsToDate } from '@/lib/gamification-api';
import { cn } from '@/lib/utils';

function formatRemaining(ms: number) {
  if (ms <= 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface HeartCounterProps {
  size?: 'sm' | 'md';
  showTimer?: boolean;
  className?: string;
}

/** ❤️ × N + countdown до следующей регенерации. */
export function HeartCounter({ size = 'md', showTimer = true, className }: HeartCounterProps) {
  const { data } = useHearts();
  const nextAt = tsToDate(data?.next_heart_at);
  const isMax = data ? data.hearts >= data.max_hearts : true;
  const showCountdown = showTimer && !!data && !isMax && nextAt !== null;

  // Локальный тикер только активен когда есть на что тикать.
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!showCountdown) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [showCountdown]);

  const remaining = showCountdown && nextAt ? Math.max(0, nextAt.getTime() - now) : 0;

  if (!data) {
    return (
      <div className={cn('flex items-center gap-1.5 text-muted-foreground', className)}>
        <Heart className={cn(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')} />
        <span className="font-bold tabular-nums">—</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5 text-red-500', className)}>
      <Heart
        className={cn(
          'fill-current',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          data.hearts === 0 && 'opacity-40',
        )}
      />
      <span className="font-bold tabular-nums">
        {data.unlimited ? '∞' : `${data.hearts}/${data.max_hearts}`}
      </span>
      {showCountdown && remaining > 0 && (
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {formatRemaining(remaining)}
        </span>
      )}
    </div>
  );
}

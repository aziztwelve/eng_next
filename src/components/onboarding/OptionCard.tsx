/**
 * OptionCard — кликабельная карточка варианта single-select шагов.
 *
 * Слева emoji (или флаг), справа title + subtitle. На selected состоянии:
 * primary border + чекмарк + scale-up. Цвет — наш brand green
 * (см. web-спека §3.1).
 */

"use client";

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OptionCardProps {
  emoji?: string;
  /** Дополнительный slot слева (например `<Image>` флага) — заменяет emoji. */
  leading?: React.ReactNode;
  title: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
  /** Передавать `data-id` для упрощённого querySelector в тестах. */
  id?: string;
  /** Отключить взаимодействие (например пока идёт PATCH). */
  disabled?: boolean;
}

export function OptionCard({
  emoji,
  leading,
  title,
  subtitle,
  selected,
  onSelect,
  id,
  disabled,
}: OptionCardProps) {
  return (
    <button
      type="button"
      data-id={id}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'group flex w-full items-center gap-4 rounded-2xl border-4 bg-card p-4 text-left transition-all',
        'hover:scale-[1.01] active:scale-100',
        selected
          ? 'border-primary bg-primary/5 shadow-[0_4px_0_0_#46a302]'
          : 'border-border/50 hover:border-primary/40',
        disabled && 'opacity-50 pointer-events-none',
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-3xl">
        {leading ?? <span aria-hidden>{emoji}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-black text-lg leading-tight">{title}</div>
        {subtitle && (
          <div className="text-sm text-muted-foreground font-medium leading-snug mt-1">
            {subtitle}
          </div>
        )}
      </div>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all',
          selected
            ? 'bg-primary text-primary-foreground scale-100'
            : 'border-2 border-border/50 scale-90 opacity-60 group-hover:opacity-100',
        )}
        aria-hidden
      >
        {selected && <Check className="h-4 w-4" />}
      </div>
    </button>
  );
}

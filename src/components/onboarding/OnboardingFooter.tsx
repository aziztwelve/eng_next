/**
 * "Continue" CTA для шагов. Изолирован, чтобы не дублировать стили
 * shadow / active-translate в каждом step'е.
 */

"use client";

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContinueButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  pending?: boolean;
  children?: ReactNode;
}

export function ContinueButton({ onClick, disabled, pending, children }: ContinueButtonProps) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={disabled || pending}
      className={cn(
        'mt-8 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg',
        'shadow-[0_4px_0_0_#46a302] hover:bg-primary/90 active:translate-y-1 active:shadow-none',
        'transition-all',
        (disabled || pending) && 'opacity-50 pointer-events-none shadow-none',
      )}
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (children ?? 'Продолжить')}
    </button>
  );
}

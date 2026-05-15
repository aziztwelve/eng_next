'use client';

import { Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface XPGainProps {
  amount: number;
  className?: string;
}

/**
 * Inline-toast-карточка для +XP. Используется через `showXPGainToast` —
 * рендерится внутри `sonner.toast.custom` и автоматически уезжает.
 */
function XPGainCard({ amount, className }: XPGainProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-2xl border-4 border-amber-400 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5',
        'shadow-[0_4px_0_0_#d97706] font-black text-amber-700 dark:text-amber-300',
        'animate-in fade-in slide-in-from-bottom-2 duration-300',
        className,
      )}
    >
      <Zap className="h-5 w-5 fill-current" />
      <span className="text-lg">+{amount} XP</span>
    </div>
  );
}

/** Триггер +XP toast'а, длительность 1.6s. */
export function showXPGainToast(amount: number) {
  if (amount <= 0) return;
  toast.custom(() => <XPGainCard amount={amount} />, {
    duration: 1600,
    position: 'top-center',
  });
}

/** Большой level-up tост с анимацией. */
export function showLevelUpToast(newLevel: number) {
  toast.custom(
    (id) => (
      <div
        className={cn(
          'flex items-center gap-3 rounded-3xl border-4 border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 px-5 py-4',
          'shadow-[0_6px_0_0_#b45309] font-black animate-in fade-in zoom-in duration-500',
        )}
        onClick={() => toast.dismiss(id)}
      >
        <div className="text-3xl">🎉</div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 tracking-widest">
            Level up
          </span>
          <span className="text-xl text-amber-700 dark:text-amber-300">
            Уровень {newLevel}!
          </span>
        </div>
      </div>
    ),
    { duration: 3500, position: 'top-center' },
  );
}

/** Тост дневной цели. */
export function showDailyGoalToast() {
  toast.custom(
    (id) => (
      <div
        className="flex items-center gap-3 rounded-3xl border-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-5 py-4 shadow-[0_6px_0_0_#047857] font-black"
        onClick={() => toast.dismiss(id)}
      >
        <div className="text-3xl">🎯</div>
        <div className="flex flex-col">
          <span className="text-xs uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">
            Daily goal
          </span>
          <span className="text-lg text-emerald-700 dark:text-emerald-300">
            Цель дня выполнена!
          </span>
        </div>
      </div>
    ),
    { duration: 3000, position: 'top-center' },
  );
}

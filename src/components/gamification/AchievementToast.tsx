'use client';

import { Award } from 'lucide-react';
import { toast } from 'sonner';
import type { UserAchievement } from '@/types/api';
import { cn } from '@/lib/utils';

const TIER_STYLES: Record<number, string> = {
  1: 'border-amber-700 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
  2: 'border-slate-400 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200',
  3: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
};

export function showAchievementToast(ua: UserAchievement) {
  const a = ua.achievement;
  const tier = TIER_STYLES[a.tier] ?? TIER_STYLES[1];
  toast.custom(
    (id) => (
      <div
        onClick={() => toast.dismiss(id)}
        className={cn(
          'flex items-start gap-3 rounded-3xl border-4 px-5 py-4 max-w-sm cursor-pointer',
          'shadow-[0_6px_0_0_rgba(0,0,0,0.15)] font-bold animate-in fade-in slide-in-from-top-2 duration-500',
          tier,
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background border-4">
          {a.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.icon_url} alt={a.title} className="h-8 w-8 object-contain" />
          ) : (
            <Award className="h-7 w-7" />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest opacity-70">
            Achievement unlocked
          </span>
          <span className="text-base font-black leading-tight">{a.title}</span>
          {a.description && (
            <span className="text-xs font-medium opacity-80 leading-snug">
              {a.description}
            </span>
          )}
          {(a.xp_reward > 0 || a.gems_reward > 0) && (
            <div className="flex gap-3 mt-1 text-xs font-bold">
              {a.xp_reward > 0 && <span>+{a.xp_reward} XP</span>}
              {a.gems_reward > 0 && <span>💎 +{a.gems_reward}</span>}
            </div>
          )}
        </div>
      </div>
    ),
    { duration: 4500, position: 'top-center' },
  );
}

/** Несколько unlock'ов подряд — раскидываем с задержкой, чтобы не накладывались. */
export function showAchievementToasts(achievements: UserAchievement[]) {
  achievements.forEach((ua, i) => {
    setTimeout(() => showAchievementToast(ua), i * 800);
  });
}

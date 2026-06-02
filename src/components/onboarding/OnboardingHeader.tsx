/**
 * Шапка онбординга: back-button слева, прогресс-бар по центру, UI-lang
 * switcher справа. Прогресс — позиция текущего шага в линейном flow
 * (см. spec §1).
 */

"use client";

import { ChevronLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

import { Progress } from '@/components/ui/progress';
import { Mascot } from './Mascot';
import { UiLanguageSwitcher } from './UiLanguageSwitcher';

/**
 * Линейный порядок страниц в онбординге для расчёта прогресса.
 * Index 0 (welcome) = 0%, последняя = 100%. Маршруты не входящие в карту
 * (paywall / signup / др.) не влияют на отображение — там просто скрываем
 * прогресс-бар.
 */
const FLOW_ORDER: ReadonlyArray<string> = [
  '/onboarding/welcome',
  '/onboarding/goal',
  '/onboarding/age',
  '/onboarding/level',
  '/onboarding/daily-commit',
  '/onboarding/pain-points',
  '/onboarding/speaking-situation',
  '/onboarding/reaction',
  '/onboarding/past-blocker',
  '/onboarding/trust',
  '/onboarding/future-regret',
  '/onboarding/emotional-reaction',
  '/onboarding/projection',
  '/onboarding/reminder-time',
  '/onboarding/push-optin',
  '/onboarding/plan',
  '/onboarding/building',
  '/onboarding/roadmap',
  '/onboarding/value-prop',
  '/onboarding/paywall',
  '/onboarding/signup',
];

function progressFor(pathname: string): number | null {
  // /onboarding/reaction?from=xxx — все 5 reaction'ов идут под один progress bucket.
  const idx = FLOW_ORDER.findIndex((r) => pathname === r || pathname.startsWith(r + '/'));
  if (idx < 0) return null;
  return Math.round((idx / (FLOW_ORDER.length - 1)) * 100);
}

export function OnboardingHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const progress = progressFor(pathname);
  const showBack = pathname !== '/onboarding/welcome' && pathname !== '/onboarding';

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border/50 hover:border-primary/40 hover:bg-accent/50 transition-colors"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <Mascot pose="idle" size={36} />
        )}

        <div className="flex-1">
          {progress !== null ? (
            <Progress value={progress} className="h-2" />
          ) : null}
        </div>

        <UiLanguageSwitcher />
      </div>
    </header>
  );
}

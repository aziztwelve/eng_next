"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useOnboardingState } from '@/hooks/use-onboarding';
import { resolveResumeStep } from '@/lib/onboarding/resume';
import { useIsAuthenticated } from '@/hooks/use-auth';

/**
 * Список реализованных шагов на текущем спринте. Если `resolveResumeStep`
 * указывает на ещё не реализованный шаг — фолбэкаемся на последний
 * реализованный, чтобы не получить 404 пока остальные страницы в работе.
 *
 * Удалить после Sprint 5 (когда все 21 страница на месте).
 */
const IMPLEMENTED_STEPS = new Set<string>([
  '/onboarding/welcome',
  '/onboarding/goal',
  '/onboarding/age',
  '/onboarding/level',
  '/onboarding/daily-commit',
]);

const LAST_IMPLEMENTED = '/onboarding/daily-commit';

/**
 * `/onboarding` — index. Резолвит resume-step из текущего onboarding-state
 * и редиректит. Пока `useOnboardingState` грузит данные — full-screen loader.
 *
 * Если пользователь уже завершил онбординг (`onboarded_at != null`),
 * `resolveResumeStep` вернёт `/dashboard`.
 *
 * Если ещё нет JWT (guest bootstrap не отработал) — ждём, потом
 * `useOnboardingState` сам fetch'нет, либо `welcome` если 404.
 */
export default function OnboardingIndexPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const { data: state, isLoading, isError } = useOnboardingState();

  // Не дёргаем replace дважды — useEffect триггерится на каждом изменении деп'ов,
  // а replace в Next 16 идемпотентен но всё равно держим guard.
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (redirected) return;
    if (authLoading || isLoading) return;
    if (!isAuthenticated || isError || !state) {
      setRedirected(true);
      router.replace('/onboarding/welcome');
      return;
    }
    let target = resolveResumeStep(state);
    if (target.startsWith('/onboarding/') && !IMPLEMENTED_STEPS.has(target)) {
      // временный safety net на спринтах 2-4
      target = LAST_IMPLEMENTED;
    }
    setRedirected(true);
    router.replace(target);
  }, [redirected, authLoading, isLoading, isAuthenticated, isError, state, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

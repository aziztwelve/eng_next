"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useOnboardingState } from '@/hooks/use-onboarding';
import { resolveResumeStep } from '@/lib/onboarding/resume';

/**
 * `/onboarding` index — резолвит, на каком шаге продолжить, и редиректит.
 *
 * Если стейт ещё грузится (или guest-bootstrap не отработал) — показываем
 * loader. Как только state есть — `resolveResumeStep` + `router.replace`.
 * Если запрос упал (нет сессии) — отправляем на welcome как safe default.
 */
export default function OnboardingIndexPage() {
  const router = useRouter();
  const { data: state, isLoading, isError } = useOnboardingState();

  useEffect(() => {
    if (state) {
      router.replace(resolveResumeStep(state));
    } else if (isError) {
      router.replace('/onboarding/welcome');
    }
  }, [state, isError, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      {/* isLoading используется неявно — просто крутим лоадер до redirect'а */}
      <span className="sr-only">{isLoading ? 'Загрузка' : 'Перенаправление'}</span>
    </div>
  );
}

"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useOnboardingState } from '@/hooks/use-onboarding';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';

/**
 * Layout всех онбординг-страниц.
 *
 * Обязанности:
 *  - Рисует шапку (прогресс + back + UI lang switcher).
 *  - Обратный гейт: если онбординг уже завершён (`onboarded_at`/`completed`),
 *    редиректим на /dashboard — кроме самого index'а `/onboarding`, который
 *    сам резолвит resume-шаг.
 *
 * `noindex` для онбординг-страниц задаётся через metadata в самих page'ах /
 * здесь не нужен (client component).
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { data: state, isLoading } = useOnboardingState();
  const router = useRouter();
  const pathname = usePathname();

  const isCompleted = !!(state?.completed || state?.onboarded_at);
  const isIndex = pathname === '/onboarding';

  useEffect(() => {
    if (isCompleted && !isIndex) {
      router.replace('/dashboard');
    }
  }, [isCompleted, isIndex, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OnboardingHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {isLoading && !state ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

import type { Metadata } from 'next';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';

/**
 * Онбординг — приватные страницы (guest JWT уже есть). Не индексируем.
 */
export const metadata: Metadata = {
  title: 'Онбординг — LingoLearn',
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OnboardingHeader />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}

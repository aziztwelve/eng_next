"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';

import { useLanguage } from '@/lib/i18n';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Mascot } from '@/components/onboarding/Mascot';
import { ContinueButton } from '@/components/onboarding/OnboardingFooter';
import { PRIMARY_LANGUAGES, type LanguageCode } from '@/lib/supported-languages';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/i18n';

export default function WelcomeStep() {
  const { t, language } = useLanguage();
  const { state, patchState, isPending } = useOnboarding();
  const router = useRouter();

  const [selected, setSelected] = useState<LanguageCode | null>(
    (state?.target_language as LanguageCode) ?? null,
  );

  const onContinue = async () => {
    if (!selected) return;
    await patchState({ target_language: selected });
    router.push('/onboarding/goal');
  };

  const features = [
    t('onboarding.welcome.features.speaking'),
    t('onboarding.welcome.features.writing'),
    t('onboarding.welcome.features.vocab'),
    t('onboarding.welcome.features.lessons'),
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <Mascot pose="cheering" size={120} priority />
        <h1 className="text-2xl md:text-3xl font-black leading-tight max-w-md">
          {t('onboarding.welcome.greetingTitle')}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold text-muted-foreground">
          {features.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t('onboarding.welcome.chooseLanguage')}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PRIMARY_LANGUAGES.map((lang) => {
            const isSel = selected === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                aria-pressed={isSel}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl border-4 bg-card p-4 transition-all hover:scale-[1.03]',
                  isSel
                    ? 'border-primary bg-primary/5 shadow-[0_4px_0_0_#46a302]'
                    : 'border-border/50 hover:border-primary/40',
                )}
              >
                <span className="text-3xl" aria-hidden>{lang.flag}</span>
                <span className="text-sm font-bold leading-tight text-center">
                  {lang.nameI18n[language as Language] ?? lang.nameNative}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <ContinueButton onClick={onContinue} disabled={!selected} pending={isPending}>
          {t('onboarding.welcome.cta')}
        </ContinueButton>

        <Link
          href="/auth?redirect=/onboarding"
          className="block text-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          {t('onboarding.haveAccount')} →
        </Link>
      </div>
    </div>
  );
}

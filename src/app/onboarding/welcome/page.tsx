"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

import { Mascot } from '@/components/onboarding/Mascot';
import { ContinueButton } from '@/components/onboarding/OnboardingFooter';
import {
  PRIMARY_LANGUAGES,
  type LanguageCode,
  languageNameForUi,
  type UiLanguage,
} from '@/lib/supported-languages';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Шаг 1 — welcome. Сетка 12 языков (адаптив 2/3/4 колонки), CTA disabled
 * пока не выбран язык.
 *
 * После выбора + клика "Начать учиться" PATCH'им target_language и
 * переходим на /onboarding/goal. Прогресс резюмится через
 * resolveResumeStep при возврате.
 */
export default function WelcomePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { state, patchState, isPending } = useOnboarding();
  const [picked, setPicked] = useState<LanguageCode | null>(
    (state?.target_language as LanguageCode | undefined) ?? null,
  );

  const onContinue = async () => {
    if (!picked) return;
    try {
      await patchState({ target_language: picked });
      router.push('/onboarding/goal');
    } catch {
      // patchState уже показывает toast.
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <Mascot pose="cheering" size={120} priority />
        <h1 className="text-3xl md:text-4xl font-black leading-tight max-w-md">
          {t('onboarding.welcome.greeting')}
        </h1>

        <ul className="grid grid-cols-2 gap-2 max-w-md text-sm font-bold text-muted-foreground">
          {[
            'onboarding.welcome.bullets.speaking',
            'onboarding.welcome.bullets.writing',
            'onboarding.welcome.bullets.vocab',
            'onboarding.welcome.bullets.ai',
          ].map((k) => (
            <li key={k} className="flex items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              {t(k)}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-black text-center mb-4">
          {t('onboarding.welcome.chooseLanguage')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PRIMARY_LANGUAGES.map((lang) => {
            const selected = picked === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setPicked(lang.code)}
                aria-pressed={selected}
                className={cn(
                  'group relative flex flex-col items-center gap-2 rounded-2xl border-4 bg-card p-4 transition-all',
                  'hover:scale-[1.02] active:scale-100',
                  selected
                    ? 'border-primary bg-primary/5 shadow-[0_4px_0_0_#46a302]'
                    : 'border-border/50 hover:border-primary/40',
                  lang.rtl && 'text-right',
                )}
              >
                <span className="text-4xl" aria-hidden>
                  {lang.flag}
                </span>
                <span className="font-black text-sm leading-tight">
                  {languageNameForUi(lang.code, language as UiLanguage)}
                </span>
                {selected && (
                  <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ContinueButton onClick={onContinue} disabled={!picked} pending={isPending}>
        {t('onboarding.welcome.cta')}
      </ContinueButton>

      <div className="flex flex-col items-center gap-4 pt-2 text-sm text-muted-foreground">
        <Link
          href="/auth?redirect=/onboarding"
          className="font-bold text-primary hover:underline"
        >
          {t('onboarding.welcome.haveAccount')} →
        </Link>
        <span className="text-xs">{t('onboarding.welcome.legal')}</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useLanguage } from '@/lib/i18n';
import { useOnboarding } from '@/hooks/use-onboarding';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { CollapsibleOptions } from '@/components/onboarding/CollapsibleOptions';
import { ContinueButton } from '@/components/onboarding/OnboardingFooter';
import type { AgeBracket } from '@/types/onboarding';

const AGE_BRACKETS: { id: AgeBracket; emoji: string }[] = [
  { id: '7-12',  emoji: '🧒' },
  { id: '13-17', emoji: '🧑‍🎓' },
  { id: '18-24', emoji: '🎒' },
  { id: '25-34', emoji: '💼' },
  { id: '35-44', emoji: '🧑‍💻' },
  { id: '45-54', emoji: '📚' },
  { id: '55+',   emoji: '🌟' },
];

export default function AgeStep() {
  const { t } = useLanguage();
  const { state, patchState, isPending } = useOnboarding();
  const router = useRouter();
  const [value, setValue] = useState<AgeBracket | null>(
    (state?.age_bracket as AgeBracket) ?? null,
  );

  const onContinue = async () => {
    if (!value) return;
    await patchState({ age_bracket: value });
    router.push('/onboarding/level');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black">{t('onboarding.age.title')}</h1>
        <p className="text-muted-foreground font-medium">{t('onboarding.age.subtitle')}</p>
      </div>

      <CollapsibleOptions selectedId={value}>
        {AGE_BRACKETS.map((a) => (
          <OptionCard
            key={a.id}
            id={a.id}
            emoji={a.emoji}
            title={a.id}
            selected={value === a.id}
            onSelect={() => setValue(value === a.id ? null : a.id)}
          />
        ))}
      </CollapsibleOptions>

      <ContinueButton onClick={onContinue} disabled={!value} pending={isPending}>
        {t('onboarding.age.cta')}
      </ContinueButton>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useLanguage } from '@/lib/i18n';
import { useOnboarding } from '@/hooks/use-onboarding';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { CollapsibleOptions } from '@/components/onboarding/CollapsibleOptions';
import { ContinueButton } from '@/components/onboarding/OnboardingFooter';
import type { GoalKey } from '@/types/onboarding';

const GOALS: { id: GoalKey; emoji: string }[] = [
  { id: 'work',       emoji: '💼' },
  { id: 'exam',       emoji: '📝' },
  { id: 'travel',     emoji: '✈️' },
  { id: 'relocation', emoji: '🌍' },
  { id: 'study',      emoji: '🎓' },
  { id: 'social',     emoji: '💬' },
  { id: 'content',    emoji: '🎬' },
  { id: 'fun',        emoji: '✨' },
  { id: 'brain',      emoji: '🧠' },
];

export default function GoalStep() {
  const { t } = useLanguage();
  const { state, patchState, isPending } = useOnboarding();
  const router = useRouter();
  const [value, setValue] = useState<GoalKey | null>(
    (state?.motivation?.[0] as GoalKey) ?? null,
  );

  const onContinue = async () => {
    if (!value) return;
    await patchState({ motivation: [value], motivation_set: true });
    router.push('/onboarding/age');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black">{t('onboarding.goal.title')}</h1>
        <p className="text-muted-foreground font-medium">{t('onboarding.goal.subtitle')}</p>
      </div>

      <CollapsibleOptions selectedId={value}>
        {GOALS.map((g) => (
          <OptionCard
            key={g.id}
            id={g.id}
            emoji={g.emoji}
            title={t(`onboarding.goal.${g.id}.title`)}
            subtitle={t(`onboarding.goal.${g.id}.sub`)}
            selected={value === g.id}
            onSelect={() => setValue(value === g.id ? null : g.id)}
          />
        ))}
      </CollapsibleOptions>

      <ContinueButton onClick={onContinue} disabled={!value} pending={isPending} />
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useLanguage } from '@/lib/i18n';
import { useOnboarding } from '@/hooks/use-onboarding';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { CollapsibleOptions } from '@/components/onboarding/CollapsibleOptions';
import { ContinueButton } from '@/components/onboarding/OnboardingFooter';
import { dailyCommitToXp, type DailyCommitMinutes } from '@/types/onboarding';

const COMMITMENTS: { id: DailyCommitMinutes; key: string; emoji: string }[] = [
  { id: 5,  key: 'min5',  emoji: '🌿' },
  { id: 10, key: 'min10', emoji: '⚡' },
  { id: 15, key: 'min15', emoji: '🔥' },
  { id: 25, key: 'min25', emoji: '🚀' },
];

export default function DailyCommitStep() {
  const { t } = useLanguage();
  const { state, patchState, isPending } = useOnboarding();
  const router = useRouter();
  const [value, setValue] = useState<DailyCommitMinutes | null>(
    (state?.daily_commit_minutes as DailyCommitMinutes) ?? null,
  );

  const onContinue = async () => {
    if (!value) return;
    await patchState({
      daily_commit_minutes: value,
      daily_goal_xp: dailyCommitToXp(value),
    });
    // Sprint 3 продолжит на pain-points. Пока ведём на index-резолвер,
    // который сам определит следующий незаполненный шаг.
    router.push('/onboarding/pain-points');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black">{t('onboarding.dailyCommit.title')}</h1>
        <p className="text-muted-foreground font-medium">{t('onboarding.dailyCommit.subtitle')}</p>
      </div>

      <CollapsibleOptions selectedId={value !== null ? String(value) : null}>
        {COMMITMENTS.map((c) => (
          <OptionCard
            key={c.id}
            id={String(c.id)}
            emoji={c.emoji}
            title={t(`onboarding.dailyCommit.${c.key}.title`)}
            subtitle={t(`onboarding.dailyCommit.${c.key}.sub`)}
            selected={value === c.id}
            onSelect={() => setValue(value === c.id ? null : c.id)}
          />
        ))}
      </CollapsibleOptions>

      <ContinueButton onClick={onContinue} disabled={!value} pending={isPending} />
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useLanguage } from '@/lib/i18n';
import { useOnboarding } from '@/hooks/use-onboarding';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { ContinueButton } from '@/components/onboarding/OnboardingFooter';
import type { ProficiencyLevel } from '@/types/onboarding';

type LevelChoice = ProficiencyLevel | 'test';

const LEVELS: { id: LevelChoice; emoji: string }[] = [
  { id: 'beginner', emoji: '🌱' },
  { id: 'a1',       emoji: '🐣' },
  { id: 'a2',       emoji: '🐤' },
  { id: 'b1',       emoji: '🦅' },
  { id: 'b2',       emoji: '🚀' },
  { id: 'c1',       emoji: '🏆' },
  { id: 'test',     emoji: '🧪' },
];

export default function LevelStep() {
  const { t } = useLanguage();
  const { state, patchState, isPending } = useOnboarding();
  const router = useRouter();
  const [value, setValue] = useState<LevelChoice | null>(
    (state?.proficiency_level as LevelChoice) ?? null,
  );

  const onContinue = async () => {
    if (!value) return;
    if (value === 'test') {
      // Mini-test реализуется в Sprint 3. Пока ведём на placement-страницу
      // (которой ещё нет — временно отправляем на daily-commit с beginner).
      // TODO(sprint3): router.push('/onboarding/placement')
      await patchState({ proficiency_level: 'beginner' });
      router.push('/onboarding/daily-commit');
      return;
    }
    await patchState({ proficiency_level: value });
    router.push('/onboarding/daily-commit');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black">{t('onboarding.level.title')}</h1>
        <p className="text-muted-foreground font-medium">{t('onboarding.level.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {LEVELS.map((l) => (
          <OptionCard
            key={l.id}
            id={l.id}
            emoji={l.emoji}
            title={t(`onboarding.level.${l.id}.title`)}
            subtitle={t(`onboarding.level.${l.id}.sub`)}
            selected={value === l.id}
            onSelect={() => setValue(l.id)}
          />
        ))}
      </div>

      <ContinueButton onClick={onContinue} disabled={!value} pending={isPending} />
    </div>
  );
}

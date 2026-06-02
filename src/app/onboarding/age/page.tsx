"use client";

import { useRouter } from 'next/navigation';

import { SingleSelectStep, type SingleSelectOption } from '@/components/onboarding/SingleSelectStep';
import { useOnboarding } from '@/hooks/use-onboarding';
import type { AgeBracket } from '@/types/onboarding';

const AGE_OPTIONS: SingleSelectOption[] = [
  { id: '7-12',  emoji: '🌱', titleKey: 'onboarding.age.options.7-12.title' },
  { id: '13-17', emoji: '📚', titleKey: 'onboarding.age.options.13-17.title' },
  { id: '18-24', emoji: '🚀', titleKey: 'onboarding.age.options.18-24.title' },
  { id: '25-34', emoji: '💼', titleKey: 'onboarding.age.options.25-34.title' },
  { id: '35-44', emoji: '🌟', titleKey: 'onboarding.age.options.35-44.title' },
  { id: '45-54', emoji: '🎯', titleKey: 'onboarding.age.options.45-54.title' },
  { id: '55+',   emoji: '🦉', titleKey: 'onboarding.age.options.55+.title' },
];

export default function AgeStep() {
  const router = useRouter();
  const { state, patchState, isPending } = useOnboarding();

  return (
    <SingleSelectStep
      titleKey="onboarding.age.title"
      subKey="onboarding.age.sub"
      options={AGE_OPTIONS}
      initial={state?.age_bracket ?? null}
      pending={isPending}
      onContinue={async (id) => {
        await patchState({ age_bracket: id as AgeBracket });
        router.push('/onboarding/level');
      }}
    />
  );
}

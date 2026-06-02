"use client";

import { useRouter } from 'next/navigation';

import { SingleSelectStep, type SingleSelectOption } from '@/components/onboarding/SingleSelectStep';
import { useOnboarding } from '@/hooks/use-onboarding';

const GOAL_OPTIONS: SingleSelectOption[] = [
  { id: 'work',       emoji: '💼', titleKey: 'onboarding.goal.options.work.title',       subKey: 'onboarding.goal.options.work.sub' },
  { id: 'exam',       emoji: '📝', titleKey: 'onboarding.goal.options.exam.title',       subKey: 'onboarding.goal.options.exam.sub' },
  { id: 'travel',     emoji: '✈️', titleKey: 'onboarding.goal.options.travel.title',     subKey: 'onboarding.goal.options.travel.sub' },
  { id: 'relocation', emoji: '🌍', titleKey: 'onboarding.goal.options.relocation.title', subKey: 'onboarding.goal.options.relocation.sub' },
  { id: 'study',      emoji: '🎓', titleKey: 'onboarding.goal.options.study.title',      subKey: 'onboarding.goal.options.study.sub' },
  { id: 'social',     emoji: '💬', titleKey: 'onboarding.goal.options.social.title',     subKey: 'onboarding.goal.options.social.sub' },
  { id: 'content',    emoji: '🎬', titleKey: 'onboarding.goal.options.content.title',    subKey: 'onboarding.goal.options.content.sub' },
  { id: 'fun',        emoji: '🎉', titleKey: 'onboarding.goal.options.fun.title',        subKey: 'onboarding.goal.options.fun.sub' },
  { id: 'brain',      emoji: '🧠', titleKey: 'onboarding.goal.options.brain.title',      subKey: 'onboarding.goal.options.brain.sub' },
];

export default function GoalStep() {
  const router = useRouter();
  const { state, patchState, isPending } = useOnboarding();

  // single-select на UI, но в backend кладём как `motivation: [id]`
  // (см. spec: motivation TEXT[]).
  const initial = state?.motivation?.[0] ?? null;

  return (
    <SingleSelectStep
      titleKey="onboarding.goal.title"
      subKey="onboarding.goal.sub"
      options={GOAL_OPTIONS}
      initial={initial}
      pending={isPending}
      onContinue={async (id) => {
        await patchState({ motivation: [id], motivation_set: true });
        router.push('/onboarding/age');
      }}
    />
  );
}

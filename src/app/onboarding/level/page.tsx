"use client";

import { useRouter } from 'next/navigation';

import { SingleSelectStep, type SingleSelectOption } from '@/components/onboarding/SingleSelectStep';
import { useOnboarding } from '@/hooks/use-onboarding';
import type { ProficiencyLevel } from '@/types/onboarding';

/**
 * Шаг 4 — Level.
 *
 * 5 уровней + 1 особый "Лучше проверю себя мини-тестом". Если выбран
 * `mini_test` — переходим на placement, в БД level пока не пишем.
 */

const LEVEL_OPTIONS: SingleSelectOption[] = [
  { id: 'beginner', emoji: '🌱', titleKey: 'onboarding.level.options.beginner.title', subKey: 'onboarding.level.options.beginner.sub' },
  { id: 'a1',       emoji: '🐣', titleKey: 'onboarding.level.options.a1.title',       subKey: 'onboarding.level.options.a1.sub' },
  { id: 'a2',       emoji: '🐥', titleKey: 'onboarding.level.options.a2.title',       subKey: 'onboarding.level.options.a2.sub' },
  { id: 'b1',       emoji: '🦅', titleKey: 'onboarding.level.options.b1.title',       subKey: 'onboarding.level.options.b1.sub' },
  { id: 'b2',       emoji: '🦉', titleKey: 'onboarding.level.options.b2.title',       subKey: 'onboarding.level.options.b2.sub' },
  { id: 'c1',       emoji: '🦋', titleKey: 'onboarding.level.options.c1.title',       subKey: 'onboarding.level.options.c1.sub' },
  { id: 'mini_test', emoji: '🎯', titleKey: 'onboarding.level.miniTest.title',          subKey: 'onboarding.level.miniTest.sub' },
];

const LEVEL_VALUES = new Set(['beginner', 'a1', 'a2', 'b1', 'b2', 'c1']);

export default function LevelStep() {
  const router = useRouter();
  const { state, patchState, isPending } = useOnboarding();

  return (
    <SingleSelectStep
      titleKey="onboarding.level.title"
      subKey="onboarding.level.sub"
      options={LEVEL_OPTIONS}
      initial={state?.proficiency_level ?? null}
      pending={isPending}
      onContinue={async (id) => {
        if (id === 'mini_test') {
          // placement page будет реализован в Sprint 3; пока идём дальше
          // как beginner — TODO заменить на router.push('/onboarding/placement').
          await patchState({ proficiency_level: 'beginner' });
          router.push('/onboarding/daily-commit');
          return;
        }
        if (LEVEL_VALUES.has(id)) {
          await patchState({ proficiency_level: id as ProficiencyLevel });
          router.push('/onboarding/daily-commit');
        }
      }}
    />
  );
}

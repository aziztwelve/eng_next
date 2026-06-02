"use client";

import { useRouter } from 'next/navigation';

import { SingleSelectStep, type SingleSelectOption } from '@/components/onboarding/SingleSelectStep';
import { useOnboarding } from '@/hooks/use-onboarding';
import { dailyCommitToXp, type DailyCommitMinutes } from '@/types/onboarding';

const COMMIT_OPTIONS: SingleSelectOption[] = [
  { id: '5',  emoji: '⏱️', titleKey: 'onboarding.dailyCommit.options.5.title',  subKey: 'onboarding.dailyCommit.options.5.sub' },
  { id: '10', emoji: '⏰', titleKey: 'onboarding.dailyCommit.options.10.title', subKey: 'onboarding.dailyCommit.options.10.sub' },
  { id: '15', emoji: '🔥', titleKey: 'onboarding.dailyCommit.options.15.title', subKey: 'onboarding.dailyCommit.options.15.sub' },
  { id: '25', emoji: '🚀', titleKey: 'onboarding.dailyCommit.options.25.title', subKey: 'onboarding.dailyCommit.options.25.sub' },
];

const VALID = new Set([5, 10, 15, 25]);

export default function DailyCommitStep() {
  const router = useRouter();
  const { state, patchState, isPending } = useOnboarding();

  return (
    <SingleSelectStep
      titleKey="onboarding.dailyCommit.title"
      subKey="onboarding.dailyCommit.sub"
      options={COMMIT_OPTIONS}
      initial={state?.daily_commit_minutes ? String(state.daily_commit_minutes) : null}
      pending={isPending}
      onContinue={async (id) => {
        const minutes = Number(id);
        if (!VALID.has(minutes)) return;
        const m = minutes as DailyCommitMinutes;
        await patchState({
          daily_commit_minutes: m,
          // зеркалим в daily_goal_xp для gamification (см. spec §1.1).
          daily_goal_xp: dailyCommitToXp(m),
        });
        // Sprint 2 финал: следующий шаг — pain-points (Sprint 3). Пока его
        // нет в роутах, ведём на /onboarding — resume-resolver покажет
        // dashboard'у завершение или welcome'у пробел.
        router.push('/onboarding');
      }}
    />
  );
}

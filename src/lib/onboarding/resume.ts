/**
 * Resume-резолвер для онбординга v3.
 *
 * Дано: текущий backend-стейт онбординга. Нужно: путь страницы, на которой
 * пользователь должен продолжить. Реализуем как линейный цепочный fallback —
 * проверяем каждое поле в порядке UX-flow и выбрасываем первый "пробел".
 *
 * Используется на `/onboarding` (index) — компонент при mount'е читает
 * state и `router.replace()` на нужный шаг.
 *
 * См. docs/tasks/web/onboarding-v3-oki-style.md §1.2.
 */

import type { OnboardingState } from '@/types/onboarding';

/**
 * Полная карта порядка шагов. Если `paywall_seen_at` есть — считаем что
 * человек прошёл основной flow и должен идти на signup (или dashboard,
 * если уже зарегистрирован — это проверяет outer guard в layout).
 */
export function resolveResumeStep(state: OnboardingState): string {
  if (state.completed || state.onboarded_at) return '/dashboard';

  if (!state.target_language)        return '/onboarding/welcome';
  if (!state.motivation?.length)     return '/onboarding/goal';
  if (!state.age_bracket)            return '/onboarding/age';
  if (!state.proficiency_level)      return '/onboarding/level';
  if (!state.daily_commit_minutes)   return '/onboarding/daily-commit';
  if (!state.pain_point)             return '/onboarding/pain-points';
  if (!state.speaking_situation)     return '/onboarding/speaking-situation';
  if (!state.past_blocker)           return '/onboarding/past-blocker';
  if (!state.future_regret)          return '/onboarding/future-regret';
  if (!state.emotional_reaction)     return '/onboarding/emotional-reaction';
  if (!state.reminder_slot)          return '/onboarding/reminder-time';
  if (!state.paywall_seen_at)        return '/onboarding/push-optin';

  // paywall был, но юзер ещё не закрыл flow — отправляем на signup.
  return '/onboarding/signup';
}

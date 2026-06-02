/**
 * Onboarding v3 — типы данных и enum-значения.
 *
 * Соответствуют backend-контракту gateway DTO
 * (`services/gateway/internal/dto/onboarding.go`) и proto
 * `shared/proto/user/v1/user.proto`.
 *
 * См. docs/tasks/web/onboarding-v3-oki-style.md.
 */

/* ──────────────────────────── enums ──────────────────────────── */

export type AgeBracket = '7-12' | '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
export type DailyCommitMinutes = 5 | 10 | 15 | 25;
export type ProficiencyLevel = 'beginner' | 'a1' | 'a2' | 'b1' | 'b2' | 'c1';
export type PainPoint = 'fear_speaking' | 'lack_vocab' | 'listening' | 'grammar' | 'consistency';
export type SpeakingSituation = 'freeze' | 'translate_in_head' | 'too_short' | 'avoid';
export type PastBlocker = 'boring' | 'too_hard' | 'no_progress' | 'no_fit' | 'no_support';
export type FutureRegret = 'stay_same' | 'limit_self' | 'pressure' | 'postpone';
export type EmotionalReaction = 'lose_confidence' | 'upset' | 'burnout' | 'lost';
export type ReminderSlot = 'morning' | 'day' | 'evening' | 'flex';
export type PaywallChoice = 'annual' | 'monthly' | 'dismissed' | 'special_offer';

export type GoalKey =
  | 'work' | 'exam' | 'travel' | 'relocation' | 'study'
  | 'social' | 'content' | 'fun' | 'brain';

/* ──────────────────────── server shapes ──────────────────────── */

/**
 * Ответ `GET /api/v1/onboarding`. Любое поле может быть отсутствующим
 * (`omitempty` со стороны gateway). `motivation` всегда массив (минимум `[]`).
 */
export interface OnboardingState {
  user_id: string;
  native_language?: string;
  target_language?: string;
  proficiency_level?: ProficiencyLevel;
  daily_goal_xp?: number;
  motivation: string[];
  signup_source?: string;
  placement_score?: number;
  date_of_birth?: string;
  onboarded_at?: string;
  completed: boolean;

  // === v3 ===
  age_bracket?: AgeBracket;
  daily_commit_minutes?: DailyCommitMinutes;
  pain_point?: PainPoint;
  speaking_situation?: SpeakingSituation;
  past_blocker?: PastBlocker;
  future_regret?: FutureRegret;
  emotional_reaction?: EmotionalReaction;
  reminder_slot?: ReminderSlot;
  paywall_seen_at?: string;
  paywall_choice?: PaywallChoice;
}

/**
 * Тело `PATCH /api/v1/onboarding`. Все поля опциональные. Для очистки
 * `motivation` в пустой массив используем `motivation_set: true`.
 */
export interface PatchOnboardingRequest {
  native_language?: string;
  target_language?: string;
  proficiency_level?: ProficiencyLevel;
  daily_goal_xp?: number;
  motivation?: string[];
  motivation_set?: boolean;
  signup_source?: string;
  placement_score?: number;
  date_of_birth?: string;

  // === v3 ===
  age_bracket?: AgeBracket;
  daily_commit_minutes?: DailyCommitMinutes;
  pain_point?: PainPoint;
  speaking_situation?: SpeakingSituation;
  past_blocker?: PastBlocker;
  future_regret?: FutureRegret;
  emotional_reaction?: EmotionalReaction;
  reminder_slot?: ReminderSlot;
  /** RFC3339-string. */
  paywall_seen_at?: string;
  paywall_choice?: PaywallChoice;
}

/* ───────────────────────── helpers ───────────────────────── */

/**
 * Маппинг `daily_commit_minutes` → `daily_goal_xp` (см. spec v2 §4 +
 * docs/tasks/mob/onboarding-v3-oki-style.md §1: 5→10, 10→20, 15→30, 25→50).
 */
export function dailyCommitToXp(min: DailyCommitMinutes): number {
  switch (min) {
    case 5:  return 10;
    case 10: return 20;
    case 15: return 30;
    case 25: return 50;
  }
}

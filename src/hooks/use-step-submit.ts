import { useMutation } from '@tanstack/react-query';

import { StepValidationApi } from '@/lib/step-validation-api';
import type { SubmitAnswerRequest, SubmitAnswerResponse } from '@/types/api';

/**
 * Phase 2: отправляет ответ на интерактивный шаг.
 *
 * Возвращает SubmitAnswerResponse — фронт сам решает, что показать
 * (правильно/неправильно/correct_answer/XP). gamification side-effects
 * уже сделаны на бэке, фронт триггерит UI через {@link useLessonGamificationFx}
 * (берёт `response.gamification`).
 */
export function useStepSubmit() {
  return useMutation<
    SubmitAnswerResponse,
    Error,
    { stepId: string; body: SubmitAnswerRequest }
  >({
    mutationFn: ({ stepId, body }) => StepValidationApi.submit(stepId, body),
  });
}

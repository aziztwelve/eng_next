import type { Step, SubmitAnswerResponse } from '@/types/api';

/**
 * Общий контракт всех step-компонентов phase-2.
 *
 * Компонент сам управляет UI-стейтом (drag&drop, выбор опции, ввод текста),
 * на submit вызывает `onSubmit(answer)` и получает {@link SubmitAnswerResponse}.
 * После получения ответа компонент может показать feedback и в конце вызвать
 * `onContinue()` чтобы перейти к следующему шагу.
 */
export interface StepComponentProps {
  step: Step;
  onSubmit: (answer: Record<string, unknown>) => Promise<SubmitAnswerResponse>;
  /** Колбэк "Дальше" — родитель сам переключает индекс. */
  onContinue: () => void;
  isLast?: boolean;
}

export function parseContent<T>(step: Step): T | null {
  try {
    return JSON.parse(step.content) as T;
  } catch {
    return null;
  }
}

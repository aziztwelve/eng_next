import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

/**
 * Общая нижняя панель для всех phase-2 step-компонентов.
 * Показывает Check (когда answer не отправлен) или Correct/Wrong feedback
 * (после submit) с кнопкой "Дальше".
 */
export type FeedbackState =
  | { kind: 'idle' }                     // initial — ничего не показываем
  | { kind: 'submitting' }
  | { kind: 'correct'; explanation?: string }
  | { kind: 'wrong'; explanation?: string; correctText?: string };

interface FeedbackBarProps {
  state: FeedbackState;
  canSubmit: boolean;
  onSubmit: () => void;
  onContinue: () => void;
  isLast?: boolean;
  submitLabel?: string;
}

export function FeedbackBar({
  state,
  canSubmit,
  onSubmit,
  onContinue,
  isLast,
  submitLabel = 'Проверить',
}: FeedbackBarProps) {
  if (state.kind === 'correct' || state.kind === 'wrong') {
    const correct = state.kind === 'correct';
    return (
      <div
        className={`rounded-2xl border-4 p-4 sm:p-5 flex items-center justify-between gap-4 ${
          correct ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {correct ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-black">
              {correct ? 'Правильно!' : 'Неправильно'}
            </p>
            {!correct && state.correctText && (
              <p className="text-sm font-bold mt-0.5 truncate">
                Правильный ответ: <span className="text-foreground">{state.correctText}</span>
              </p>
            )}
            {state.explanation && (
              <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-3">
                {state.explanation}
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={onContinue}
          className="h-12 rounded-2xl font-bold px-5 shrink-0 gap-2"
        >
          {isLast ? 'Завершить' : 'Дальше'}
          {!isLast && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button
        onClick={onSubmit}
        disabled={!canSubmit || state.kind === 'submitting'}
        className="h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-bold shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all"
      >
        {submitLabel}
      </Button>
    </div>
  );
}

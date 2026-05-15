"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import type { TranslateContent } from '@/types/api';

/**
 * Translate: тап-only (без полного DnD — UX как Duolingo на mobile-web).
 * Клик по слову в word_bank → переходит в answer area; клик по слову
 * в answer area → возвращается в bank. Финальный submit — массив `words`.
 */
export function TranslateStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const content = parseContent<TranslateContent>(step);
  const bank = content?.word_bank ?? [];

  // Состояние: индексы слов в банке, выбранные пользователем.
  // Один и тот же индекс может быть использован один раз.
  const [picked, setPicked] = useState<number[]>([]);
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  if (!content) {
    return (
      <Card className="rounded-2xl border-4 p-6 font-medium text-muted-foreground">
        Не удалось распарсить контент шага translate.
      </Card>
    );
  }

  const available = bank.map((_, i) => i).filter((i) => !picked.includes(i));

  const handleSubmit = async () => {
    if (picked.length === 0) return;
    setState({ kind: 'submitting' });
    try {
      const words = picked.map((i) => bank[i]);
      const resp = await onSubmit({ words });
      const correctText =
        (resp.correct_answer as { text?: string } | undefined)?.text ?? content.correct_translation;
      setState(
        resp.is_correct
          ? { kind: 'correct', explanation: resp.explanation }
          : { kind: 'wrong', explanation: resp.explanation, correctText },
      );
    } catch (e) {
      console.error(e);
      setState({ kind: 'idle' });
    }
  };

  const locked = state.kind === 'correct' || state.kind === 'wrong' || state.kind === 'submitting';

  return (
    <div className="space-y-6">
      {/* Source */}
      <Card className="rounded-2xl border-4 p-6 bg-primary/5">
        <p className="text-xl font-black">{content.source_text}</p>
        {content.instruction && (
          <p className="text-sm text-muted-foreground font-medium mt-2">{content.instruction}</p>
        )}
      </Card>

      {/* Answer area */}
      <div className="min-h-[80px] rounded-2xl border-4 border-dashed border-border bg-muted/20 p-3 flex flex-wrap gap-2">
        {picked.length === 0 ? (
          <p className="text-sm text-muted-foreground font-medium m-auto">
            Нажми на слова из банка ниже
          </p>
        ) : (
          picked.map((i) => (
            <button
              key={`p-${i}`}
              disabled={locked}
              onClick={() => setPicked((p) => p.filter((x) => x !== i))}
              className="px-3 py-2 rounded-xl border-2 bg-card font-bold shadow-sm disabled:opacity-70 disabled:cursor-not-allowed hover:bg-accent/40"
            >
              {bank[i]}
            </button>
          ))
        )}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {available.map((i) => (
          <button
            key={`b-${i}`}
            disabled={locked}
            onClick={() => setPicked((p) => [...p, i])}
            className="px-3 py-2 rounded-xl border-2 bg-card font-bold shadow-[0_2px_0_0_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/40"
          >
            {bank[i]}
          </button>
        ))}
      </div>

      <FeedbackBar
        state={state}
        canSubmit={picked.length > 0}
        onSubmit={handleSubmit}
        onContinue={onContinue}
        isLast={isLast}
      />
    </div>
  );
}

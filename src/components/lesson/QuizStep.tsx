"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';

/**
 * Quiz (phase-2): single multiple-choice по индексу. Content:
 * `{ question, options: [{text, is_correct}], explanation }`.
 *
 * Legacy формат `{ questions: [...] }` (несколько вопросов в одном шаге)
 * не поддерживается этим компонентом — он для нового формата.
 */
interface QuizContentNew {
  instruction?: string;
  question: string;
  image_url?: string;
  audio_url?: string;
  options: Array<{ text: string; is_correct: boolean }>;
  explanation?: string;
}

export function QuizStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const content = parseContent<QuizContentNew>(step);
  const [picked, setPicked] = useState<number | null>(null);
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  if (!content || !content.options) {
    return (
      <Card className="rounded-2xl border-4 p-6 font-medium text-muted-foreground">
        Не удалось распарсить контент шага quiz (phase-2 формат).
      </Card>
    );
  }

  const locked = state.kind !== 'idle';

  const handleSubmit = async () => {
    if (picked === null) return;
    setState({ kind: 'submitting' });
    try {
      const resp = await onSubmit({ index: picked });
      // Найдём текст правильного option-а для feedback.
      const correctIdx = content.options.findIndex((o) => o.is_correct);
      const correctText = correctIdx >= 0 ? content.options[correctIdx].text : undefined;
      setState(
        resp.is_correct
          ? { kind: 'correct', explanation: resp.explanation ?? content.explanation }
          : {
              kind: 'wrong',
              explanation: resp.explanation ?? content.explanation,
              correctText,
            },
      );
    } catch (e) {
      console.error(e);
      setState({ kind: 'idle' });
    }
  };

  return (
    <div className="space-y-6">
      {content.instruction && (
        <p className="text-sm text-muted-foreground font-bold">{content.instruction}</p>
      )}
      <Card className="rounded-2xl border-4 p-6 bg-primary/5">
        <h3 className="text-xl font-black">{content.question}</h3>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {content.options.map((opt, i) => {
          const isPicked = picked === i;
          const showCorrect = state.kind === 'correct' && isPicked;
          const showWrong = state.kind === 'wrong' && isPicked;
          const showCorrectOnReveal = state.kind === 'wrong' && opt.is_correct;
          return (
            <button
              key={i}
              disabled={locked}
              onClick={() => setPicked(i)}
              className={`p-4 rounded-2xl border-4 text-left font-bold transition ${
                showCorrect || showCorrectOnReveal
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : showWrong
                    ? 'border-red-500 bg-red-500/10'
                    : isPicked
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent/40'
              } disabled:cursor-not-allowed`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      <FeedbackBar
        state={state}
        canSubmit={picked !== null}
        onSubmit={handleSubmit}
        onContinue={onContinue}
        isLast={isLast}
      />
    </div>
  );
}

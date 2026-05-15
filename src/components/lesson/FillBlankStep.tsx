"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import type { FillBlankContent } from '@/types/api';

/**
 * Fill in the Blank: предложение с `___`. Если есть options — кнопки,
 * иначе — input.
 */
export function FillBlankStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const content = parseContent<FillBlankContent>(step);
  const [value, setValue] = useState('');
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  if (!content) {
    return (
      <Card className="rounded-2xl border-4 p-6 font-medium text-muted-foreground">
        Не удалось распарсить контент шага fill_blank.
      </Card>
    );
  }

  const locked = state.kind !== 'idle';

  const handleSubmit = async (val: string) => {
    if (!val.trim()) return;
    setState({ kind: 'submitting' });
    try {
      const resp = await onSubmit({ answer: val });
      const correctText =
        (resp.correct_answer as { answer?: string } | undefined)?.answer ?? content.correct_answer;
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

  // Разобьём шаблон вокруг "___"
  const tplParts = content.sentence_template.split('___');

  return (
    <div className="space-y-6">
      {content.instruction && <p className="text-base font-bold">{content.instruction}</p>}

      <Card className="rounded-2xl border-4 p-6 bg-primary/5">
        <p className="text-xl font-black leading-relaxed flex flex-wrap items-baseline gap-1">
          {tplParts.map((part, i) => (
            <span key={i}>
              {part}
              {i < tplParts.length - 1 && (
                <span className="inline-flex mx-1 px-3 py-1 min-w-[80px] border-b-4 border-primary font-black">
                  {value || '\u00A0\u00A0\u00A0'}
                </span>
              )}
            </span>
          ))}
        </p>
        {content.translation_hint && (
          <p className="text-sm text-muted-foreground font-medium mt-3">
            {content.translation_hint}
          </p>
        )}
      </Card>

      {content.options && content.options.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {content.options.map((opt) => (
            <button
              key={opt}
              disabled={locked}
              onClick={() => {
                setValue(opt);
                void handleSubmit(opt);
              }}
              className={`p-4 rounded-2xl border-4 font-bold transition ${
                value === opt
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent/40'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <Input
          value={value}
          disabled={locked}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Введите ответ..."
          className="rounded-2xl border-4 h-14 font-bold text-base"
        />
      )}

      <FeedbackBar
        state={state}
        canSubmit={value.trim().length > 0}
        onSubmit={() => handleSubmit(value)}
        onContinue={onContinue}
        isLast={isLast}
      />
    </div>
  );
}

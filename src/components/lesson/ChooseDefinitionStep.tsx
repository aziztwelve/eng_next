"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import { useLanguage } from '@/lib/i18n';
import { stepInstruction } from '@/lib/step-titles';

interface ChooseDefinitionContent {
  word: string;
  options: Array<{ id: string; text: string; is_correct: boolean }>;
  explanation?: string;
}

export function ChooseDefinitionStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const { language } = useLanguage();
  const content = parseContent<ChooseDefinitionContent>(step);
  const [picked, setPicked] = useState<number | null>(null);
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  if (!content?.word || !content.options?.length) {
    return <Card className="rounded-2xl border-4 p-6 text-muted-foreground">Invalid choose_definition content.</Card>;
  }

  const locked = state.kind !== 'idle';
  const submit = async () => {
    if (picked === null) return;
    setState({ kind: 'submitting' });
    try {
      const response = await onSubmit({ index: picked });
      const correctText = content.options.find((option) => option.is_correct)?.text;
      setState(response.is_correct
        ? { kind: 'correct', explanation: response.explanation ?? content.explanation }
        : { kind: 'wrong', explanation: response.explanation ?? content.explanation, correctText });
    } catch {
      setState({ kind: 'idle' });
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground font-bold">{stepInstruction(step.type, language)}</p>
      <Card className="rounded-2xl border-4 p-6 bg-primary/5 text-center">
        <p className="text-sm font-bold text-muted-foreground">Word</p>
        <h3 className="mt-1 text-3xl font-black">{content.word}</h3>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {content.options.map((option, index) => {
          const selected = picked === index;
          const correct = state.kind === 'wrong' && option.is_correct;
          const wrong = state.kind === 'wrong' && selected;
          return (
            <button key={option.id} disabled={locked} onClick={() => setPicked(index)} className={`rounded-2xl border-4 p-4 text-left font-bold transition ${correct || (state.kind === 'correct' && selected) ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-red-500 bg-red-500/10' : selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/40'} disabled:cursor-not-allowed`}>
              <span className="mr-2 text-muted-foreground">{option.id}.</span>{option.text}
            </button>
          );
        })}
      </div>
      <FeedbackBar state={state} canSubmit={picked !== null} onSubmit={submit} onContinue={onContinue} isLast={isLast} />
    </div>
  );
}

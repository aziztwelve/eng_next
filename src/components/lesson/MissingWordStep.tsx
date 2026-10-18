"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import { useLanguage } from '@/lib/i18n';
import { stepInstruction } from '@/lib/step-titles';

interface MissingWordContent {
  sentence_template: string;
  correct_answer: string;
  hint_prefix: string;
  explanation?: string;
}

export function MissingWordStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const { language } = useLanguage();
  const content = parseContent<MissingWordContent>(step);
  const [suffix, setSuffix] = useState('');
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  if (!content?.sentence_template || !content.hint_prefix) {
    return <Card className="rounded-2xl border-4 p-6 text-muted-foreground">Invalid missing_word content.</Card>;
  }

  const locked = state.kind !== 'idle';
  const submit = async () => {
    if (!suffix.trim()) return;
    setState({ kind: 'submitting' });
    try {
      const response = await onSubmit({ text: `${content.hint_prefix}${suffix}` });
      setState(response.is_correct
        ? { kind: 'correct', explanation: response.explanation ?? content.explanation }
        : { kind: 'wrong', explanation: response.explanation ?? content.explanation, correctText: content.correct_answer });
    } catch {
      setState({ kind: 'idle' });
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground font-bold">{stepInstruction(step.type, language)}</p>
      <Card className="rounded-2xl border-4 p-6 text-center"><p className="text-2xl font-black">{content.sentence_template}</p></Card>
      <div className="flex items-center justify-center">
        <span className="rounded-l-2xl border-4 border-r-0 border-primary bg-primary/10 px-4 py-3 text-xl font-black">{content.hint_prefix}</span>
        <Input value={suffix} onChange={(event) => setSuffix(event.target.value)} disabled={locked} autoCapitalize="none" className="h-14 max-w-48 rounded-l-none rounded-r-2xl border-4 text-xl font-bold" aria-label="Complete the missing word" />
      </div>
      <FeedbackBar state={state} canSubmit={suffix.trim().length > 0} onSubmit={submit} onContinue={onContinue} isLast={isLast} />
    </div>
  );
}

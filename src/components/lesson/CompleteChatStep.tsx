"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import { useLanguage } from '@/lib/i18n';
import { stepInstruction } from '@/lib/step-titles';

interface CompleteChatContent {
  dialogue: Array<{ speaker: string; text: string }>;
  answer_speaker?: string;
  options: Array<{ id: string; text: string; is_correct: boolean }>;
  explanation?: string;
}

export function CompleteChatStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const { language } = useLanguage();
  const content = parseContent<CompleteChatContent>(step);
  const [picked, setPicked] = useState<string | null>(null);
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });
  if (!content?.dialogue?.length || !content.options?.length) return <Card className="rounded-2xl border-4 p-6 text-muted-foreground">Invalid complete_chat content.</Card>;
  const locked = state.kind !== 'idle';
  const submit = async () => {
    if (!picked) return;
    setState({ kind: 'submitting' });
    try {
      const response = await onSubmit({ option_id: picked });
      const correctText = content.options.find((option) => option.is_correct)?.text;
      setState(response.is_correct ? { kind: 'correct', explanation: response.explanation ?? content.explanation } : { kind: 'wrong', explanation: response.explanation ?? content.explanation, correctText });
    } catch { setState({ kind: 'idle' }); }
  };
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground font-bold">{stepInstruction(step.type, language)}</p>
    <Card className="rounded-2xl border-4 p-5 space-y-3">{content.dialogue.map((line, index) => <div key={index}><p className="text-xs font-black text-primary">{line.speaker}</p><p className="font-bold">{line.text}</p></div>)}<p className="border-t-2 pt-3 font-black text-muted-foreground">{content.answer_speaker ?? 'You'}: ___</p></Card>
    <div className="grid gap-3">{content.options.map((option) => { const selected = picked === option.id; const correct = state.kind === 'wrong' && option.is_correct; const wrong = state.kind === 'wrong' && selected; return <button key={option.id} disabled={locked} onClick={() => setPicked(option.id)} className={`rounded-2xl border-4 p-4 text-left font-bold ${correct || (state.kind === 'correct' && selected) ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-red-500 bg-red-500/10' : selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/40'}`}>{option.text}</button>; })}</div>
    <FeedbackBar state={state} canSubmit={picked !== null} onSubmit={submit} onContinue={onContinue} isLast={isLast} />
  </div>;
}

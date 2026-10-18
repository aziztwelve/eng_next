"use client";

import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import { useLanguage } from '@/lib/i18n';
import { stepInstruction } from '@/lib/step-titles';

interface ListenChooseWordContent {
  sentence_template: string;
  audio_text: string;
  language: string;
  audio_url?: string;
  options: Array<{ id: string; audio_text: string; audio_url?: string; is_correct: boolean }>;
  explanation?: string;
}

export function ListenChooseWordStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const { language } = useLanguage();
  const content = parseContent<ListenChooseWordContent>(step);
  const [picked, setPicked] = useState<string | null>(null);
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  if (!content?.sentence_template || !content.audio_text || !content.options?.length) {
    return <Card className="rounded-2xl border-4 p-6 text-muted-foreground">Invalid listen_choose_word content.</Card>;
  }

  const locked = state.kind !== 'idle';
  const play = (text: string, url?: string) => {
    if (url) {
      void new Audio(url).play();
      return;
    }
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };
  const submit = async () => {
    if (!picked) return;
    setState({ kind: 'submitting' });
    try {
      const response = await onSubmit({ option_id: picked });
      setState(response.is_correct
        ? { kind: 'correct', explanation: response.explanation ?? content.explanation }
        : { kind: 'wrong', explanation: response.explanation ?? content.explanation });
    } catch {
      setState({ kind: 'idle' });
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground font-bold">{stepInstruction(step.type, language)}</p>
      <Card className="rounded-2xl border-4 p-6 text-center">
        <button onClick={() => play(content.audio_text, content.audio_url)} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Play sentence">
          <Volume2 className="h-7 w-7" />
        </button>
        <p className="text-2xl font-black">{content.sentence_template}</p>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {content.options.map((option) => {
          const selected = picked === option.id;
          const correct = state.kind === 'wrong' && option.is_correct;
          const wrong = state.kind === 'wrong' && selected;
          return <button key={option.id} disabled={locked} onClick={() => setPicked(option.id)} className={`rounded-2xl border-4 p-5 transition ${correct || (state.kind === 'correct' && selected) ? 'border-emerald-500 bg-emerald-500/10' : wrong ? 'border-red-500 bg-red-500/10' : selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/40'}`} aria-label={`Play option ${option.id}`}>
            <Volume2 onClick={(event) => { event.stopPropagation(); play(option.audio_text, option.audio_url); }} className="mx-auto h-8 w-8" />
          </button>;
        })}
      </div>
      <FeedbackBar state={state} canSubmit={picked !== null} onSubmit={submit} onContinue={onContinue} isLast={isLast} />
    </div>
  );
}

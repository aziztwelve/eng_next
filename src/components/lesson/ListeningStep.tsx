"use client";

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Volume2, Turtle } from 'lucide-react';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import type { ListeningContent } from '@/types/api';

/**
 * Listening: play audio (если есть audio_url), input для ввода. Поддерживает
 * "slow play" через playbackRate=0.5.
 */
export function ListeningStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const content = parseContent<ListeningContent>(step);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [text, setText] = useState('');
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  if (!content) {
    return (
      <Card className="rounded-2xl border-4 p-6 font-medium text-muted-foreground">
        Не удалось распарсить контент шага listening.
      </Card>
    );
  }

  const play = (rate = 1) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setState({ kind: 'submitting' });
    try {
      const resp = await onSubmit({ text });
      const correctText =
        (resp.correct_answer as { text?: string } | undefined)?.text ?? content.audio_text;
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

  const locked = state.kind !== 'idle';

  return (
    <div className="space-y-6">
      {content.instruction && <p className="text-base font-bold">{content.instruction}</p>}

      <Card className="rounded-2xl border-4 p-6 bg-primary/5 flex items-center gap-4">
        {content.audio_url ? (
          <>
            <audio ref={audioRef} src={content.audio_url} preload="auto" />
            <button
              onClick={() => play(1)}
              className="rounded-full bg-primary text-primary-foreground w-16 h-16 flex items-center justify-center hover:bg-primary/90"
              aria-label="Play"
            >
              <Volume2 className="w-7 h-7" />
            </button>
            <button
              onClick={() => play(0.5)}
              className="rounded-full bg-card border-2 w-12 h-12 flex items-center justify-center hover:bg-accent/40"
              aria-label="Slow play"
              title="Медленнее"
            >
              <Turtle className="w-5 h-5" />
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground font-medium">
            (Аудио отсутствует — введите текст по подсказке: <strong>{content.translation_hint ?? content.audio_text}</strong>)
          </p>
        )}
      </Card>

      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={locked}
        placeholder="Введите то, что вы слышите..."
        className="rounded-2xl border-4 h-14 font-bold text-base"
      />

      {content.translation_hint && state.kind === 'idle' && (
        <p className="text-xs text-muted-foreground font-medium">
          Подсказка: {content.translation_hint}
        </p>
      )}

      <FeedbackBar
        state={state}
        canSubmit={text.trim().length > 0}
        onSubmit={handleSubmit}
        onContinue={onContinue}
        isLast={isLast}
      />
    </div>
  );
}

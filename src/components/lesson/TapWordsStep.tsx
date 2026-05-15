"use client";

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import type { TapWordsContent } from '@/types/api';

/**
 * Tap What You Hear: похож на Translate, но фраза задаётся через
 * аудио (audio_url) или audio_text (fallback). Порядок слов важен.
 */
export function TapWordsStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const content = parseContent<TapWordsContent>(step);
  const bank = content?.word_bank ?? [];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  if (!content) {
    return (
      <Card className="rounded-2xl border-4 p-6 font-medium text-muted-foreground">
        Не удалось распарсить контент шага tap_words.
      </Card>
    );
  }

  const available = bank.map((_, i) => i).filter((i) => !picked.includes(i));
  const locked = state.kind !== 'idle';

  const play = (rate = 1) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  };

  const handleSubmit = async () => {
    if (picked.length === 0) return;
    setState({ kind: 'submitting' });
    try {
      const words = picked.map((i) => bank[i]);
      const resp = await onSubmit({ words });
      const correct = resp.correct_answer as string[] | undefined;
      setState(
        resp.is_correct
          ? { kind: 'correct', explanation: resp.explanation }
          : {
              kind: 'wrong',
              explanation: resp.explanation,
              correctText: Array.isArray(correct) ? correct.join(' ') : undefined,
            },
      );
    } catch (e) {
      console.error(e);
      setState({ kind: 'idle' });
    }
  };

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
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </>
        ) : (
          <p className="text-base font-bold">{content.audio_text}</p>
        )}
      </Card>

      <div className="min-h-[80px] rounded-2xl border-4 border-dashed border-border bg-muted/20 p-3 flex flex-wrap gap-2">
        {picked.length === 0 ? (
          <p className="text-sm text-muted-foreground font-medium m-auto">
            Нажми на слова в правильном порядке
          </p>
        ) : (
          picked.map((i) => (
            <button
              key={`p-${i}`}
              disabled={locked}
              onClick={() => setPicked((p) => p.filter((x) => x !== i))}
              className="px-3 py-2 rounded-xl border-2 bg-card font-bold shadow-sm disabled:opacity-70 hover:bg-accent/40"
            >
              {bank[i]}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {available.map((i) => (
          <button
            key={`b-${i}`}
            disabled={locked}
            onClick={() => setPicked((p) => [...p, i])}
            className="px-3 py-2 rounded-xl border-2 bg-card font-bold shadow-[0_2px_0_0_rgba(0,0,0,0.1)] disabled:opacity-50 hover:bg-accent/40"
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

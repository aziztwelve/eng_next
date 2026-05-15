"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import type { MatchPairsContent } from '@/types/api';

/**
 * Match Pairs: тап-стиль. Колонки L/R перемешаны.
 * Tap на left → tap на right → проверка локально (анимация). Когда все
 * пары собраны — submit. Backend подтверждает финальный score.
 */
export function MatchPairsStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const content = parseContent<MatchPairsContent>(step);
  const pairs = content?.pairs ?? [];

  // Перемешанные индексы для колонок (стабильно в рамках step.id).
  const { leftOrder, rightOrder } = useMemo(() => {
    const lo = pairs.map((_, i) => i);
    const ro = pairs.map((_, i) => i);
    // Псевдо-shuffle на основе step.id, чтобы был стабильный порядок.
    let seed = 0;
    for (const ch of step.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = ro.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [ro[i], ro[j]] = [ro[j], ro[i]];
    }
    return { leftOrder: lo, rightOrder: ro };
  }, [step.id, pairs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedL, setSelectedL] = useState<number | null>(null);
  const [selectedR, setSelectedR] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]); // pair indices
  const [wrongFlash, setWrongFlash] = useState(false);
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  // При совпадении обеих — проверяем
  useEffect(() => {
    if (selectedL === null || selectedR === null) return;
    if (selectedL === selectedR) {
      setMatched((m) => [...m, selectedL]);
      setSelectedL(null);
      setSelectedR(null);
    } else {
      setWrongFlash(true);
      const t = setTimeout(() => {
        setSelectedL(null);
        setSelectedR(null);
        setWrongFlash(false);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [selectedL, selectedR]);

  const allMatched = matched.length === pairs.length && pairs.length > 0;

  if (!content) {
    return (
      <Card className="rounded-2xl border-4 p-6 font-medium text-muted-foreground">
        Не удалось распарсить контент шага match_pairs.
      </Card>
    );
  }

  const handleSubmit = async () => {
    setState({ kind: 'submitting' });
    try {
      // Поскольку всё локально-проверено — отправляем правильный mapping
      // целиком (left → right). Backend подтвердит.
      const mapping: Record<string, string> = {};
      pairs.forEach((p) => {
        mapping[p.left] = p.right;
      });
      const resp = await onSubmit({ pairs: mapping });
      setState(
        resp.is_correct
          ? { kind: 'correct', explanation: resp.explanation }
          : { kind: 'wrong', explanation: resp.explanation },
      );
    } catch (e) {
      console.error(e);
      setState({ kind: 'idle' });
    }
  };

  const renderCell = (
    pairIdx: number,
    side: 'L' | 'R',
    text: string,
  ) => {
    const isMatched = matched.includes(pairIdx);
    const isSelected = side === 'L' ? selectedL === pairIdx : selectedR === pairIdx;
    const isWrong = wrongFlash && isSelected;
    return (
      <button
        key={`${side}-${pairIdx}`}
        disabled={isMatched || state.kind !== 'idle'}
        onClick={() => {
          if (side === 'L') setSelectedL(pairIdx);
          else setSelectedR(pairIdx);
        }}
        className={`w-full p-4 rounded-2xl border-4 text-center font-bold transition ${
          isMatched
            ? 'border-emerald-500 bg-emerald-500/15 opacity-60 cursor-default'
            : isWrong
              ? 'border-red-500 bg-red-500/10'
              : isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-accent/40'
        }`}
      >
        {text}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {content.instruction && (
        <p className="text-base font-bold">{content.instruction}</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-3">
          {leftOrder.map((i) => renderCell(i, 'L', pairs[i].left))}
        </div>
        <div className="flex flex-col gap-3">
          {rightOrder.map((i) => renderCell(i, 'R', pairs[i].right))}
        </div>
      </div>

      <FeedbackBar
        state={state}
        canSubmit={allMatched}
        onSubmit={handleSubmit}
        onContinue={onContinue}
        isLast={isLast}
        submitLabel="Готово"
      />
    </div>
  );
}

"use client";

import { Card } from '@/components/ui/card';
import { TranslateStep } from './TranslateStep';
import { MatchPairsStep } from './MatchPairsStep';
import { ListeningStep } from './ListeningStep';
import { FillBlankStep } from './FillBlankStep';
import { TapWordsStep } from './TapWordsStep';
import { QuizStep } from './QuizStep';
import { StoryStep } from './StoryStep';
import type { StepComponentProps } from './types';

/**
 * Главный switch для phase-2 интерактивных шагов.
 * Не покрывает legacy `text` / `video` — их рендерит lesson-page напрямую
 * (они НЕ интерактивные, используют MarkStepComplete не submit).
 */
export function StepRenderer(props: StepComponentProps) {
  switch (props.step.type) {
    case 'translate':
      return <TranslateStep {...props} />;
    case 'match_pairs':
      return <MatchPairsStep {...props} />;
    case 'listening':
      return <ListeningStep {...props} />;
    case 'fill_blank':
      return <FillBlankStep {...props} />;
    case 'tap_words':
      return <TapWordsStep {...props} />;
    case 'quiz':
      return <QuizStep {...props} />;
    case 'story':
      return <StoryStep {...props} />;
    default:
      return (
        <Card className="rounded-2xl border-4 p-6 font-medium text-muted-foreground">
          Тип шага «{props.step.type}» не поддержан интерактивным флоу.
        </Card>
      );
  }
}

export { TranslateStep, MatchPairsStep, ListeningStep, FillBlankStep, TapWordsStep, QuizStep, StoryStep };

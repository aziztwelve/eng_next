'use client';

import { useMemo } from 'react';
import { TranslateEditor } from './TranslateEditor';
import { MatchPairsEditor } from './MatchPairsEditor';
import { ListeningEditor } from './ListeningEditor';
import { FillBlankEditor } from './FillBlankEditor';
import { TapWordsEditor } from './TapWordsEditor';
import { StoryEditor } from './StoryEditor';
import { safeParseContent } from './types';
import type {
  StepType,
  TranslateContent,
  MatchPairsContent,
  ListeningContent,
  FillBlankContent,
  TapWordsContent,
  StoryContent,
} from '@/types/api';

/**
 * Универсальный редактор content для phase-2 типов.
 * Принимает raw JSON string + stepType, рендерит per-type форму, на каждое
 * изменение вызывает `onChange(jsonString)`.
 */
export interface PhaseTwoStepEditorProps {
  stepType: StepType;
  contentJSON: string;
  onChange: (contentJSON: string) => void;
}

export function PhaseTwoStepEditor({ stepType, contentJSON, onChange }: PhaseTwoStepEditorProps) {
  const handle = <T,>(v: T) => onChange(JSON.stringify(v));

  const parsed = useMemo(() => {
    return {
      translate: safeParseContent<TranslateContent>(contentJSON),
      match: safeParseContent<MatchPairsContent>(contentJSON),
      listening: safeParseContent<ListeningContent>(contentJSON),
      fill: safeParseContent<FillBlankContent>(contentJSON),
      tap: safeParseContent<TapWordsContent>(contentJSON),
      story: safeParseContent<StoryContent>(contentJSON),
    };
  }, [contentJSON]);

  switch (stepType) {
    case 'translate':
      return <TranslateEditor value={parsed.translate} onChange={handle} />;
    case 'match_pairs':
      return <MatchPairsEditor value={parsed.match} onChange={handle} />;
    case 'listening':
      return <ListeningEditor value={parsed.listening} onChange={handle} />;
    case 'fill_blank':
      return <FillBlankEditor value={parsed.fill} onChange={handle} />;
    case 'tap_words':
      return <TapWordsEditor value={parsed.tap} onChange={handle} />;
    case 'story':
      return <StoryEditor value={parsed.story} onChange={handle} />;
    default:
      return null;
  }
}

export const PHASE_TWO_STEP_TYPES: StepType[] = [
  'translate', 'match_pairs', 'listening', 'fill_blank', 'tap_words', 'story',
];

export function isPhaseTwoStepType(t: string): t is StepType {
  return (PHASE_TWO_STEP_TYPES as string[]).includes(t);
}

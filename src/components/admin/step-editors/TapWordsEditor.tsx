'use client';

import { useState, useEffect } from 'react';
import type { TapWordsContent } from '@/types/api';
import type { StepContentEditorProps } from './types';
import { Field } from './TranslateEditor';

export function TapWordsEditor({ value, onChange }: StepContentEditorProps<TapWordsContent>) {
  const [v, setV] = useState<Partial<TapWordsContent>>(value);

  useEffect(() => setV(value), [value]);

  const patch = (next: Partial<TapWordsContent>) => {
    const merged = { ...v, ...next };
    setV(merged);
    onChange({
      word_bank: merged.word_bank ?? [],
      correct_words: merged.correct_words ?? [],
      ...merged,
    } as TapWordsContent);
  };

  return (
    <div className="space-y-3">
      <Field label="Audio text (что говорит диктор)">
        <input
          className="w-full px-3 py-2 border rounded-md"
          placeholder="I want to drink water"
          value={v.audio_text ?? ''}
          onChange={(e) => patch({ audio_text: e.target.value })}
        />
      </Field>
      <Field label="Audio URL">
        <input
          className="w-full px-3 py-2 border rounded-md"
          placeholder="https://..."
          value={v.audio_url ?? ''}
          onChange={(e) => patch({ audio_url: e.target.value })}
        />
      </Field>
      <Field label="Correct words (через запятую, в правильном порядке)" required>
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={(v.correct_words ?? []).join(', ')}
          onChange={(e) =>
            patch({
              correct_words: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </Field>
      <Field label="Word bank (через запятую — должен включать correct_words + distractor'ы)" required>
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={(v.word_bank ?? []).join(', ')}
          onChange={(e) =>
            patch({
              word_bank: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </Field>
      <Field label="Explanation (optional)">
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={2}
          value={v.explanation ?? ''}
          onChange={(e) => patch({ explanation: e.target.value })}
        />
      </Field>
    </div>
  );
}

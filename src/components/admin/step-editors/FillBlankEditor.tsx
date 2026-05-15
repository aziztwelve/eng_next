'use client';

import { useState, useEffect } from 'react';
import type { FillBlankContent } from '@/types/api';
import type { StepContentEditorProps } from './types';
import { Field } from './TranslateEditor';

export function FillBlankEditor({ value, onChange }: StepContentEditorProps<FillBlankContent>) {
  const [v, setV] = useState<Partial<FillBlankContent>>(value);

  useEffect(() => setV(value), [value]);

  const patch = (next: Partial<FillBlankContent>) => {
    const merged = { ...v, ...next };
    setV(merged);
    onChange({
      sentence_template: merged.sentence_template ?? '',
      correct_answer: merged.correct_answer ?? '',
      ...merged,
    } as FillBlankContent);
  };

  return (
    <div className="space-y-3">
      <Field label="Sentence template (используй ___ для blank)" required>
        <input
          className="w-full px-3 py-2 border rounded-md font-mono"
          placeholder="Yo ___ café"
          value={v.sentence_template ?? ''}
          onChange={(e) => patch({ sentence_template: e.target.value })}
        />
      </Field>
      <Field label="Correct answer" required>
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={v.correct_answer ?? ''}
          onChange={(e) => patch({ correct_answer: e.target.value })}
        />
      </Field>
      <Field label="Options (через запятую, optional — если задано, пользователь выбирает кнопкой)">
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={(v.options ?? []).join(', ')}
          onChange={(e) =>
            patch({ options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
          }
        />
      </Field>
      <Field label="Alternatives (по одному на строку, для свободного ввода)">
        <textarea
          className="w-full px-3 py-2 border rounded-md font-mono text-sm"
          rows={2}
          value={(v.alternatives ?? []).join('\n')}
          onChange={(e) =>
            patch({
              alternatives: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </Field>
      <Field label="Translation hint">
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={v.translation_hint ?? ''}
          onChange={(e) => patch({ translation_hint: e.target.value })}
        />
      </Field>
      <Field label="Explanation">
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

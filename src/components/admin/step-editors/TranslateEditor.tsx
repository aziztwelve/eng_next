'use client';

import { useState, useEffect } from 'react';
import type { TranslateContent } from '@/types/api';
import type { StepContentEditorProps } from './types';

export function TranslateEditor({ value, onChange }: StepContentEditorProps<TranslateContent>) {
  const [v, setV] = useState<Partial<TranslateContent>>(value);

  useEffect(() => {
    setV(value);
  }, [value]);

  const patch = (next: Partial<TranslateContent>) => {
    const merged = { ...v, ...next };
    setV(merged);
    onChange({
      source_text: merged.source_text ?? '',
      correct_translation: merged.correct_translation ?? '',
      word_bank: merged.word_bank ?? [],
      ...merged,
    } as TranslateContent);
  };

  const wordBank = (v.word_bank ?? []).join(', ');
  const alternatives = (v.alternative_answers ?? []).join('\n');

  return (
    <div className="space-y-3">
      <Field label="Source text (исходное предложение)" required>
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={v.source_text ?? ''}
          onChange={(e) => patch({ source_text: e.target.value })}
        />
      </Field>
      <Field label="Correct translation" required>
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={v.correct_translation ?? ''}
          onChange={(e) => patch({ correct_translation: e.target.value })}
        />
      </Field>
      <Field label="Word bank (через запятую — должен включать слова правильного перевода + distractor'ы)">
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={wordBank}
          onChange={(e) =>
            patch({
              word_bank: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </Field>
      <Field label="Альтернативные ответы (по одному на строку, optional)">
        <textarea
          className="w-full px-3 py-2 border rounded-md font-mono text-sm"
          rows={3}
          value={alternatives}
          onChange={(e) =>
            patch({
              alternative_answers: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </Field>
      <Field label="Source language">
        <input
          className="w-full px-3 py-2 border rounded-md"
          placeholder="en / es / ..."
          value={v.source_language ?? ''}
          onChange={(e) => patch({ source_language: e.target.value })}
        />
      </Field>
      <Field label="Target language">
        <input
          className="w-full px-3 py-2 border rounded-md"
          placeholder="ru / es / ..."
          value={v.target_language ?? ''}
          onChange={(e) => patch({ target_language: e.target.value })}
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

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

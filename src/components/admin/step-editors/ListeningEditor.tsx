'use client';

import { useState, useEffect } from 'react';
import type { ListeningContent } from '@/types/api';
import type { StepContentEditorProps } from './types';
import { Field } from './TranslateEditor';

export function ListeningEditor({ value, onChange }: StepContentEditorProps<ListeningContent>) {
  const [v, setV] = useState<Partial<ListeningContent>>(value);

  useEffect(() => setV(value), [value]);

  const patch = (next: Partial<ListeningContent>) => {
    const merged = { ...v, ...next };
    setV(merged);
    onChange({
      audio_text: merged.audio_text ?? '',
      ...merged,
    } as ListeningContent);
  };

  return (
    <div className="space-y-3">
      <Field label="Audio text (текст для прослушивания)" required>
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={v.audio_text ?? ''}
          onChange={(e) => patch({ audio_text: e.target.value })}
        />
      </Field>
      <Field label="Audio URL (mp3/ogg/wav в MinIO)">
        <input
          className="w-full px-3 py-2 border rounded-md"
          placeholder="https://..."
          value={v.audio_url ?? ''}
          onChange={(e) => patch({ audio_url: e.target.value })}
        />
      </Field>
      <Field label="Translation hint (показывается при идле)">
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={v.translation_hint ?? ''}
          onChange={(e) => patch({ translation_hint: e.target.value })}
        />
      </Field>
      <Field label="Language">
        <input
          className="w-full px-3 py-2 border rounded-md"
          placeholder="es / en / ..."
          value={v.language ?? ''}
          onChange={(e) => patch({ language: e.target.value })}
        />
      </Field>
      <Field label="Alternative answers (по одному на строку)">
        <textarea
          className="w-full px-3 py-2 border rounded-md font-mono text-sm"
          rows={3}
          value={(v.alternative_answers ?? []).join('\n')}
          onChange={(e) =>
            patch({
              alternative_answers: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </Field>
    </div>
  );
}

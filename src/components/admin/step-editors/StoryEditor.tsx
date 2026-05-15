'use client';

import { useState, useEffect } from 'react';
import type { StoryContent, StoryScene } from '@/types/api';
import type { StepContentEditorProps } from './types';
import { Field } from './TranslateEditor';
import RichTextEditor from '@/components/admin/course/RichTextEditor';

export function StoryEditor({ value, onChange }: StepContentEditorProps<StoryContent>) {
  const [scenes, setScenes] = useState<StoryScene[]>(value.scenes ?? []);
  const [title, setTitle] = useState(value.title ?? '');

  useEffect(() => {
    setScenes(value.scenes ?? []);
    setTitle(value.title ?? '');
  }, [value]);

  const sync = (next: { title?: string; scenes?: StoryScene[] }) => {
    const t = next.title ?? title;
    const s = next.scenes ?? scenes;
    setTitle(t);
    setScenes(s);
    onChange({ title: t || undefined, scenes: s });
  };

  const updateScene = (idx: number, patch: Partial<StoryScene>) => {
    const next = scenes.slice();
    next[idx] = { ...next[idx], ...patch };
    sync({ scenes: next });
  };

  const updateOption = (sIdx: number, oIdx: number, patch: Partial<{ text: string; is_correct: boolean }>) => {
    const scene = scenes[sIdx];
    const opts = (scene.options ?? []).slice();
    opts[oIdx] = { ...opts[oIdx], ...patch };
    updateScene(sIdx, { options: opts });
  };

  return (
    <div className="space-y-4">
      <Field label="Title">
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={title}
          onChange={(e) => sync({ title: e.target.value })}
        />
      </Field>

      <div className="text-sm font-medium text-gray-700">Сцены</div>
      {scenes.map((scene, i) => (
        <div key={i} className="border-2 rounded-md p-3 space-y-2 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">#{i + 1}</span>
            <select
              className="px-2 py-1 border rounded-md text-sm"
              value={scene.type ?? 'narrative'}
              onChange={(e) =>
                updateScene(i, {
                  type: e.target.value as 'narrative' | 'choice',
                  options:
                    e.target.value === 'choice'
                      ? scene.options ?? [{ text: '', is_correct: true }]
                      : undefined,
                })
              }
            >
              <option value="narrative">narrative</option>
              <option value="choice">choice</option>
            </select>
            <button
              type="button"
              className="ml-auto px-2 py-1 text-red-600 text-sm hover:bg-red-50 rounded"
              onClick={() => sync({ scenes: scenes.filter((_, idx) => idx !== i) })}
            >
              ✕ Удалить
            </button>
          </div>

          <input
            placeholder="Image URL"
            className="w-full px-2 py-1 border rounded text-sm"
            value={scene.image_url ?? ''}
            onChange={(e) => updateScene(i, { image_url: e.target.value })}
          />
          <input
            placeholder="Character"
            className="w-full px-2 py-1 border rounded text-sm"
            value={scene.character ?? ''}
            onChange={(e) => updateScene(i, { character: e.target.value })}
          />

          <div>
            <div className="text-xs font-medium text-gray-600 mb-0.5">Text (реплика)</div>
            <RichTextEditor
              value={scene.text ?? ''}
              onChange={(v) => updateScene(i, { text: v })}
              placeholder="**жирный** для новой лексики, *курсив* для имён собственных..."
              rows={3}
            />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-0.5">Translation</div>
            <RichTextEditor
              value={scene.translation ?? ''}
              onChange={(v) => updateScene(i, { translation: v })}
              placeholder="Перевод реплики на родной язык ученика..."
              rows={2}
            />
          </div>

          {scene.type === 'choice' && (
            <div className="space-y-1 pl-3 border-l-2">
              <input
                placeholder="Question"
                className="w-full px-2 py-1 border rounded text-sm font-medium"
                value={scene.question ?? ''}
                onChange={(e) => updateScene(i, { question: e.target.value })}
              />
              {(scene.options ?? []).map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    value={opt.text}
                    onChange={(e) => updateOption(i, oi, { text: e.target.value })}
                  />
                  <label className="text-xs flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={opt.is_correct}
                      onChange={(e) => updateOption(i, oi, { is_correct: e.target.checked })}
                    />
                    correct
                  </label>
                  <button
                    type="button"
                    className="text-red-600 text-sm"
                    onClick={() => {
                      const opts = (scene.options ?? []).filter((_, idx) => idx !== oi);
                      updateScene(i, { options: opts });
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="px-2 py-1 text-xs border rounded hover:bg-white"
                onClick={() =>
                  updateScene(i, {
                    options: [...(scene.options ?? []), { text: '', is_correct: false }],
                  })
                }
              >
                + Option
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
        onClick={() => sync({ scenes: [...scenes, { type: 'narrative' }] })}
      >
        + Добавить сцену
      </button>
    </div>
  );
}

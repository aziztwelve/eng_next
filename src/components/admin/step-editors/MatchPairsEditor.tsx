'use client';

import { useState, useEffect } from 'react';
import type { MatchPairsContent, MatchPairsPair } from '@/types/api';
import type { StepContentEditorProps } from './types';
import { Field } from './TranslateEditor';

export function MatchPairsEditor({ value, onChange }: StepContentEditorProps<MatchPairsContent>) {
  const [pairs, setPairs] = useState<MatchPairsPair[]>(value.pairs ?? []);
  const [instruction, setInstruction] = useState(value.instruction ?? '');
  const [explanation, setExplanation] = useState(value.explanation ?? '');

  useEffect(() => {
    setPairs(value.pairs ?? []);
    setInstruction(value.instruction ?? '');
    setExplanation(value.explanation ?? '');
  }, [value]);

  const update = (next: { pairs?: MatchPairsPair[]; instruction?: string; explanation?: string }) => {
    const newPairs = next.pairs ?? pairs;
    const newInstr = next.instruction ?? instruction;
    const newExp = next.explanation ?? explanation;
    setPairs(newPairs);
    setInstruction(newInstr);
    setExplanation(newExp);
    onChange({
      pairs: newPairs,
      instruction: newInstr || undefined,
      explanation: newExp || undefined,
    });
  };

  return (
    <div className="space-y-3">
      <Field label="Instruction (optional)">
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={instruction}
          onChange={(e) => update({ instruction: e.target.value })}
        />
      </Field>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">
          Пары (min 4 для нормального UX)
        </div>
        {pairs.map((p, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              placeholder="Left"
              className="flex-1 px-3 py-2 border rounded-md"
              value={p.left}
              onChange={(e) => {
                const next = pairs.slice();
                next[i] = { ...next[i], left: e.target.value };
                update({ pairs: next });
              }}
            />
            <span className="text-gray-400">↔</span>
            <input
              placeholder="Right"
              className="flex-1 px-3 py-2 border rounded-md"
              value={p.right}
              onChange={(e) => {
                const next = pairs.slice();
                next[i] = { ...next[i], right: e.target.value };
                update({ pairs: next });
              }}
            />
            <button
              type="button"
              className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
              onClick={() => update({ pairs: pairs.filter((_, idx) => idx !== i) })}
              aria-label="remove pair"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          onClick={() => update({ pairs: [...pairs, { left: '', right: '' }] })}
        >
          + Добавить пару
        </button>
      </div>

      <Field label="Explanation (optional)">
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={2}
          value={explanation}
          onChange={(e) => update({ explanation: e.target.value })}
        />
      </Field>
    </div>
  );
}

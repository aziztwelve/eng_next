'use client';

import { useState, useEffect } from 'react';
import { Field } from './TranslateEditor';

/**
 * Универсальный quiz-редактор. Поддерживает два формата:
 *
 *  1. Phase-2 single-question (StepRenderer.QuizStep / QuizInteractiveStep):
 *     `{ question, options: [{text, is_correct}], explanation? }`
 *
 *  2. Legacy multi-question (eng_next2 lessons/[id]/page.tsx StepBody quiz
 *     + eng_mob quiz-step.tsx):
 *     `{ questions: [{question, options: string[], correct_answer: index,
 *        explanation?}] }`
 *
 * Формат определяется по наличию `questions` массива в content. Админ
 * может явно переключиться через radio.
 */

interface QuizEditorProps {
  contentJSON: string;
  onChange: (contentJSON: string) => void;
}

type Mode = 'single' | 'multi';

interface SinglePhase2 {
  instruction?: string;
  question: string;
  image_url?: string;
  audio_url?: string;
  options: Array<{ text: string; is_correct: boolean }>;
  explanation?: string;
}

interface LegacyQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface LegacyMulti {
  questions: LegacyQuestion[];
}

function detectMode(raw: string): Mode {
  try {
    const v = JSON.parse(raw) as Partial<LegacyMulti & SinglePhase2>;
    if (Array.isArray(v.questions)) return 'multi';
    if (Array.isArray(v.options)) return 'single';
  } catch {
    /* fall through */
  }
  return 'single';
}

function parseSingle(raw: string): SinglePhase2 {
  try {
    const v = JSON.parse(raw) as Partial<SinglePhase2>;
    return {
      instruction: v.instruction,
      question: v.question ?? '',
      image_url: v.image_url,
      audio_url: v.audio_url,
      options: Array.isArray(v.options) ? v.options : [],
      explanation: v.explanation,
    };
  } catch {
    return { question: '', options: [] };
  }
}

function parseMulti(raw: string): LegacyMulti {
  try {
    const v = JSON.parse(raw) as Partial<LegacyMulti>;
    return { questions: Array.isArray(v.questions) ? v.questions : [] };
  } catch {
    return { questions: [] };
  }
}

export function QuizEditor({ contentJSON, onChange }: QuizEditorProps) {
  const [mode, setMode] = useState<Mode>(() => detectMode(contentJSON));

  // Источник истины — locale state, чтобы при переключении режима не
  // терять то что в textarea. На каждое изменение пишем JSON наверх.
  const [single, setSingle] = useState<SinglePhase2>(() => parseSingle(contentJSON));
  const [multi, setMulti] = useState<LegacyMulti>(() => parseMulti(contentJSON));

  // При смене входящего contentJSON извне (загрузка существующего step) —
  // перечитываем.
  useEffect(() => {
    setMode(detectMode(contentJSON));
    setSingle(parseSingle(contentJSON));
    setMulti(parseMulti(contentJSON));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentJSON]);

  const syncSingle = (next: SinglePhase2) => {
    setSingle(next);
    onChange(JSON.stringify(next));
  };
  const syncMulti = (next: LegacyMulti) => {
    setMulti(next);
    onChange(JSON.stringify(next));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-md p-2 text-sm">
        <span className="font-medium text-gray-700">Формат:</span>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={mode === 'single'}
            onChange={() => {
              setMode('single');
              // Не теряем previous single state, просто переключаем.
              onChange(JSON.stringify(single));
            }}
          />
          <span>Single (Phase 2)</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={mode === 'multi'}
            onChange={() => {
              setMode('multi');
              onChange(JSON.stringify(multi));
            }}
          />
          <span>Multi-question (Legacy)</span>
        </label>
      </div>

      {mode === 'single' ? (
        <SinglePhase2Form value={single} onChange={syncSingle} />
      ) : (
        <LegacyMultiForm value={multi} onChange={syncMulti} />
      )}
    </div>
  );
}

function SinglePhase2Form({
  value,
  onChange,
}: {
  value: SinglePhase2;
  onChange: (v: SinglePhase2) => void;
}) {
  const patch = (p: Partial<SinglePhase2>) => onChange({ ...value, ...p });

  const setOption = (i: number, o: Partial<{ text: string; is_correct: boolean }>) => {
    const opts = value.options.slice();
    opts[i] = { ...opts[i], ...o };
    patch({ options: opts });
  };

  const setCorrect = (i: number) => {
    // Single-correct поведение: только один is_correct=true.
    const opts = value.options.map((o, idx) => ({ ...o, is_correct: idx === i }));
    patch({ options: opts });
  };

  return (
    <>
      <Field label="Instruction (optional)">
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={value.instruction ?? ''}
          onChange={(e) => patch({ instruction: e.target.value })}
        />
      </Field>
      <Field label="Question" required>
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={value.question}
          onChange={(e) => patch({ question: e.target.value })}
        />
      </Field>
      <Field label="Image URL (optional)">
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={value.image_url ?? ''}
          onChange={(e) => patch({ image_url: e.target.value })}
        />
      </Field>
      <Field label="Audio URL (optional)">
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={value.audio_url ?? ''}
          onChange={(e) => patch({ audio_url: e.target.value })}
        />
      </Field>

      <div>
        <div className="text-sm font-medium text-gray-700 mb-1">
          Options <span className="text-red-500">*</span> (отметь правильный)
        </div>
        <div className="space-y-2">
          {value.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                checked={opt.is_correct}
                onChange={() => setCorrect(i)}
              />
              <input
                placeholder={`Option ${i + 1}`}
                className="flex-1 px-3 py-2 border rounded-md"
                value={opt.text}
                onChange={(e) => setOption(i, { text: e.target.value })}
              />
              <button
                type="button"
                onClick={() => patch({ options: value.options.filter((_, idx) => idx !== i) })}
                className="text-red-600 px-2 hover:bg-red-50 rounded"
                aria-label="remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          onClick={() =>
            patch({ options: [...value.options, { text: '', is_correct: false }] })
          }
        >
          + Add option
        </button>
      </div>

      <Field label="Explanation (optional)">
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={2}
          value={value.explanation ?? ''}
          onChange={(e) => patch({ explanation: e.target.value })}
        />
      </Field>
    </>
  );
}

function LegacyMultiForm({
  value,
  onChange,
}: {
  value: LegacyMulti;
  onChange: (v: LegacyMulti) => void;
}) {
  const updateQuestion = (i: number, patch: Partial<LegacyQuestion>) => {
    const qs = value.questions.slice();
    qs[i] = { ...qs[i], ...patch };
    onChange({ questions: qs });
  };

  const updateOption = (qi: number, oi: number, text: string) => {
    const q = value.questions[qi];
    const opts = q.options.slice();
    opts[oi] = text;
    updateQuestion(qi, { options: opts });
  };

  return (
    <div className="space-y-4">
      {value.questions.map((q, i) => (
        <div key={i} className="border-2 rounded-md p-3 bg-gray-50 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Question #{i + 1}</span>
            <button
              type="button"
              className="ml-auto text-red-600 text-sm hover:bg-red-50 rounded px-2 py-0.5"
              onClick={() =>
                onChange({ questions: value.questions.filter((_, idx) => idx !== i) })
              }
            >
              ✕ Удалить
            </button>
          </div>
          <input
            placeholder="Question text"
            className="w-full px-3 py-2 border rounded-md"
            value={q.question}
            onChange={(e) => updateQuestion(i, { question: e.target.value })}
          />
          <div className="space-y-1 pl-3 border-l-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={q.correct_answer === oi}
                  onChange={() => updateQuestion(i, { correct_answer: oi })}
                />
                <input
                  placeholder={`Option ${oi + 1}`}
                  className="flex-1 px-2 py-1.5 border rounded text-sm"
                  value={opt}
                  onChange={(e) => updateOption(i, oi, e.target.value)}
                />
                <button
                  type="button"
                  className="text-red-600 text-sm"
                  onClick={() => {
                    const opts = q.options.filter((_, idx) => idx !== oi);
                    let correct = q.correct_answer;
                    if (correct >= opts.length) correct = Math.max(0, opts.length - 1);
                    else if (correct > oi) correct--;
                    updateQuestion(i, { options: opts, correct_answer: correct });
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="px-2 py-0.5 text-xs border rounded hover:bg-white"
              onClick={() => updateQuestion(i, { options: [...q.options, ''] })}
            >
              + Option
            </button>
          </div>
          <input
            placeholder="Explanation (optional)"
            className="w-full px-3 py-1.5 border rounded text-sm"
            value={q.explanation ?? ''}
            onChange={(e) => updateQuestion(i, { explanation: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
        onClick={() =>
          onChange({
            questions: [
              ...value.questions,
              { question: '', options: ['', ''], correct_answer: 0 },
            ],
          })
        }
      >
        + Добавить вопрос
      </button>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { FeedbackBar, type FeedbackState } from './FeedbackBar';
import { parseContent, type StepComponentProps } from './types';
import type { StoryContent, StoryScene } from '@/types/api';

/**
 * Story: последовательно показываем сцены. На choice-сценах пользователь
 * выбирает вариант. После последней сцены — submit (массив выбранных
 * индексов в порядке появления choice-сцен).
 */
export function StoryStep({ step, onSubmit, onContinue, isLast }: StepComponentProps) {
  const content = parseContent<StoryContent>(step);
  const scenes = content?.scenes ?? [];
  const [sceneIdx, setSceneIdx] = useState(0);
  const [choices, setChoices] = useState<number[]>([]); // в порядке появления choice-сцен
  const [state, setState] = useState<FeedbackState>({ kind: 'idle' });

  if (!content || scenes.length === 0) {
    return (
      <Card className="rounded-2xl border-4 p-6 font-medium text-muted-foreground">
        Не удалось распарсить контент шага story.
      </Card>
    );
  }

  const scene: StoryScene = scenes[sceneIdx];
  const isChoice = scene.type === 'choice' && scene.options && scene.options.length > 0;
  const lastScene = sceneIdx === scenes.length - 1;

  const handleChoice = (idx: number) => {
    setChoices((c) => [...c, idx]);
    if (!lastScene) {
      setSceneIdx(sceneIdx + 1);
    } else {
      void submit([...choices, idx]);
    }
  };

  const handleNext = () => {
    if (lastScene) {
      void submit(choices);
    } else {
      setSceneIdx(sceneIdx + 1);
    }
  };

  const submit = async (allChoices: number[]) => {
    setState({ kind: 'submitting' });
    try {
      const resp = await onSubmit({ choices: allChoices });
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

  // Feedback state: показываем только финальную панель
  if (state.kind === 'correct' || state.kind === 'wrong') {
    return (
      <div className="space-y-6">
        {content.title && <h3 className="text-2xl font-black">{content.title}</h3>}
        <FeedbackBar
          state={state}
          canSubmit={false}
          onSubmit={() => {}}
          onContinue={onContinue}
          isLast={isLast}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {content.title && <h3 className="text-2xl font-black">{content.title}</h3>}
      {/* Прогресс по сценам */}
      <div className="flex gap-1">
        {scenes.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= sceneIdx ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <Card className="rounded-2xl border-4 p-6 space-y-4">
        {scene.image_url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <Image
              src={scene.image_url}
              alt={scene.character ?? 'scene'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        {scene.character && (
          <p className="text-sm font-bold text-muted-foreground uppercase">{scene.character}</p>
        )}
        {scene.text && (
          <div className="prose prose-lg max-w-none dark:prose-invert prose-p:my-0 prose-p:text-xl prose-p:font-black">
            <ReactMarkdown>{scene.text}</ReactMarkdown>
          </div>
        )}
        {scene.translation && (
          <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground prose-p:my-0 prose-p:font-medium">
            <ReactMarkdown>{scene.translation}</ReactMarkdown>
          </div>
        )}
        {isChoice && scene.question && (
          <p className="text-base font-bold pt-2">{scene.question}</p>
        )}
      </Card>

      {isChoice && scene.options ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scene.options.map((opt, i) => (
            <button
              key={i}
              disabled={state.kind === 'submitting'}
              onClick={() => handleChoice(i)}
              className="p-4 rounded-2xl border-4 text-left font-bold border-border hover:bg-accent/40"
            >
              {opt.text}
            </button>
          ))}
        </div>
      ) : (
        <FeedbackBar
          state={state}
          canSubmit={true}
          onSubmit={handleNext}
          onContinue={onContinue}
          isLast={isLast}
          submitLabel={lastScene ? 'Завершить' : 'Дальше'}
        />
      )}
    </div>
  );
}

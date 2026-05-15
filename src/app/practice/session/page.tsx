'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Loader2,
  Sparkles,
  TrendingDown,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StepRenderer } from '@/components/lesson/StepRenderer';
import { useLessonGamificationFx } from '@/hooks/use-gamification-fx';
import { useStep } from '@/hooks/use-steps';
import { useStepSubmit } from '@/hooks/use-step-submit';
import {
  MISTAKES_KEY,
  SKILLS_KEY,
  SKILLS_WEAK_KEY,
  SRS_DUE_KEY,
  SRS_STATS_KEY,
  SRS_WEAK_KEY,
  useGeneratePracticeSession,
} from '@/hooks/use-srs';
import { useQueryClient } from '@tanstack/react-query';
import {
  isInteractiveStep,
  practiceSourceLabel,
  type PracticeItem,
  type SubmitAnswerResponse,
} from '@/types/api';

/**
 * /practice/session — одна сессия практики.
 *
 * Сценарий:
 *   1. На mount генерируем сессию (POST /practice/session, size=10).
 *   2. Прогоняем items по очереди — каждый item.step_id → useStep →
 *      <StepRenderer> с тем же интерфейсом, что и обычный урок.
 *   3. После каждого correct/incorrect двигаем индекс. SRS-карточка и
 *      mistake-resolution делаются на бэке автоматически в step-validation.
 *   4. На последнем шаге — экран summary + ссылка обратно.
 */
export default function PracticeSessionPage() {
  const generate = useGeneratePracticeSession();
  const fireGamificationFx = useLessonGamificationFx();
  const qc = useQueryClient();

  const [items, setItems] = useState<PracticeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Array<{ correct: boolean }>>([]);
  // Лениво инициализируется в useEffect (Date.now — impure, нельзя в render).
  const startedAtRef = useRef<number>(0);

  // На mount запрашиваем сессию ровно один раз.
  const didGenerate = useRef(false);
  useEffect(() => {
    if (didGenerate.current) return;
    didGenerate.current = true;
    startedAtRef.current = Date.now();
    generate.mutate(
      { size: 10 },
      {
        onSuccess: (data) => {
          setItems(data.items ?? []);
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = items.length;
  const isFinished = total > 0 && index >= total;
  const current = items[index];
  const progressPct = total === 0 ? 0 : Math.round(((index + (isFinished ? 0 : 1)) / total) * 100);

  // === Loading / error states ===
  if (generate.isPending && items.length === 0) {
    return (
      <ContainerWithBack>
        <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      </ContainerWithBack>
    );
  }
  if (generate.isError) {
    return (
      <ContainerWithBack>
        <Card className="rounded-3xl border-4 p-8 text-center space-y-4">
          <p className="font-bold">Не удалось сгенерировать сессию.</p>
          <Button
            onClick={() => generate.mutate({ size: 10 })}
            className="rounded-2xl h-12 px-6 font-bold"
          >
            Попробовать ещё раз
          </Button>
        </Card>
      </ContainerWithBack>
    );
  }
  if (items.length === 0) {
    return (
      <ContainerWithBack>
        <Card className="rounded-3xl border-4 p-12 text-center space-y-4">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-black">Сейчас нечего повторять</h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">
            Карточек на повторение нет, ошибок и слабых навыков тоже. Хорошая
            работа — возвращайтесь, когда наберётся материал.
          </p>
          <Button asChild className="rounded-2xl h-12 px-6 font-bold">
            <Link href="/practice">К практике</Link>
          </Button>
        </Card>
      </ContainerWithBack>
    );
  }

  if (isFinished) {
    const correct = results.filter((r) => r.correct).length;
    return (
      <ContainerWithBack>
        <Card className="rounded-3xl border-4 p-8 text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-3xl font-black">Сессия завершена!</h2>
          <p className="text-muted-foreground font-medium">
            Верно: <b className="text-foreground">{correct}</b> из {total}
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Button
              onClick={() => {
                // Перезапрос «свежей» сессии с актуальным SRS-состоянием.
                qc.invalidateQueries({ queryKey: SRS_STATS_KEY });
                qc.invalidateQueries({ queryKey: SRS_DUE_KEY });
                qc.invalidateQueries({ queryKey: SRS_WEAK_KEY });
                qc.invalidateQueries({ queryKey: MISTAKES_KEY });
                qc.invalidateQueries({ queryKey: SKILLS_KEY });
                qc.invalidateQueries({ queryKey: SKILLS_WEAK_KEY });
                setItems([]);
                setIndex(0);
                setResults([]);
                didGenerate.current = false;
                generate.mutate(
                  { size: 10 },
                  {
                    onSuccess: (data) => setItems(data.items ?? []),
                  },
                );
              }}
              className="rounded-2xl h-12 px-6 font-bold"
            >
              Ещё одна сессия
            </Button>
            <Button asChild variant="outline" className="rounded-2xl h-12 px-6 font-bold border-2">
              <Link href="/practice">К практике</Link>
            </Button>
          </div>
        </Card>
      </ContainerWithBack>
    );
  }

  return (
    <ContainerWithBack>
      <ProgressBar pct={progressPct} index={index} total={total} />
      {current && (
        <CurrentStepCard
          item={current}
          onResult={(correct) => {
            setResults((r) => [...r, { correct }]);
          }}
          onContinue={() => setIndex((i) => i + 1)}
          fireGamificationFx={fireGamificationFx}
          startedAtRef={startedAtRef}
          onAdvance={() => {
            startedAtRef.current = Date.now();
          }}
        />
      )}
    </ContainerWithBack>
  );
}

function ContainerWithBack({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 py-8">
      <Button asChild variant="ghost" className="rounded-xl font-bold w-fit">
        <Link href="/practice">
          <ArrowLeft className="w-4 h-4 mr-2" />
          К практике
        </Link>
      </Button>
      {children}
    </div>
  );
}

function ProgressBar({ pct, index, total }: { pct: number; index: number; total: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden p-1 border-2">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-black text-sm tabular-nums">
        {index + 1} / {total}
      </span>
    </div>
  );
}

function SourceBadge({ item }: { item: PracticeItem }) {
  const src = practiceSourceLabel(item.source);
  if (src === 'overdue') {
    return (
      <Badge className="rounded-full bg-primary text-primary-foreground font-bold gap-1.5">
        <Clock className="w-3 h-3" />
        К повторению
      </Badge>
    );
  }
  if (src === 'mistake') {
    return (
      <Badge className="rounded-full bg-orange-500 text-white font-bold gap-1.5">
        <AlertTriangle className="w-3 h-3" />
        Ошибка
      </Badge>
    );
  }
  if (src === 'weak') {
    return (
      <Badge className="rounded-full bg-amber-500 text-white font-bold gap-1.5">
        <TrendingDown className="w-3 h-3" />
        Слабая
      </Badge>
    );
  }
  return null;
}

function CurrentStepCard({
  item,
  onResult,
  onContinue,
  fireGamificationFx,
  startedAtRef,
  onAdvance,
}: {
  item: PracticeItem;
  onResult: (correct: boolean) => void;
  onContinue: () => void;
  fireGamificationFx: ReturnType<typeof useLessonGamificationFx>;
  startedAtRef: React.RefObject<number>;
  onAdvance: () => void;
}) {
  const step = useStep(item.step_id);
  const submit = useStepSubmit();
  const lastResultRef = useRef<{ stepId: string; correct: boolean } | null>(null);

  // Сбрасываем timer на каждый новый шаг.
  useEffect(() => {
    onAdvance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.step_id]);

  const interactive = useMemo(
    () => step.data?.step && isInteractiveStep(step.data.step.type),
    [step.data],
  );

  const handleSubmit = async (
    answer: Record<string, unknown>,
  ): Promise<SubmitAnswerResponse> => {
    if (!step.data?.step) throw new Error('no step loaded');
    const timeMs = Math.max(0, Date.now() - startedAtRef.current);
    const resp = await submit.mutateAsync({
      stepId: step.data.step.id,
      body: { answer, time_spent_ms: timeMs, source_type: 'standalone' },
    });
    if (resp.is_correct) {
      void fireGamificationFx(resp.gamification);
    }
    // Зафиксируем результат — но в parent отдадим только на onContinue, чтобы
    // не двинуть индекс раньше чем компонент покажет фидбек.
    lastResultRef.current = { stepId: step.data.step.id, correct: !!resp.is_correct };
    return resp;
  };

  const handleContinue = () => {
    if (lastResultRef.current) {
      onResult(lastResultRef.current.correct);
      lastResultRef.current = null;
    }
    onContinue();
  };

  if (step.isLoading) {
    return (
      <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }
  if (step.isError || !step.data?.step) {
    return (
      <Card className="rounded-3xl border-4 p-8 text-center space-y-3">
        <p className="font-bold">Не удалось загрузить шаг.</p>
        <Button onClick={onContinue} className="rounded-2xl h-10 px-5 font-bold">
          Пропустить
        </Button>
      </Card>
    );
  }
  if (!interactive) {
    // Без интерактивной обёртки practice смысла не имеет — отмечаем как «пройдено»
    // на бэке через MarkStepComplete нельзя (это не урок), просто переходим дальше.
    return (
      <Card className="rounded-3xl border-4 p-8 space-y-4">
        <SourceBadge item={item} />
        <h2 className="text-xl font-black">{step.data.step.title}</h2>
        <p className="text-muted-foreground font-medium">
          Этот шаг — не интерактивный, в практике пропускаем.
        </p>
        <Button
          onClick={() => {
            onResult(true);
            onContinue();
          }}
          className="rounded-2xl h-12 px-6 font-bold"
        >
          Дальше
        </Button>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <SourceBadge item={item} />
        <Badge variant="outline" className="rounded-full px-3 py-1 font-bold border-2 uppercase">
          {step.data.step.type}
        </Badge>
        <h2 className="text-2xl font-black">{step.data.step.title}</h2>
      </div>

      <StepRenderer step={step.data.step} onSubmit={handleSubmit} onContinue={handleContinue} />
    </section>
  );
}

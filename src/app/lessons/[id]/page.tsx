"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Play, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { useLesson } from "@/hooks/use-lessons";
import { useCompleteStep } from "@/hooks/use-progress";
import { useStepSubmit } from "@/hooks/use-step-submit";
import { useLessonGamificationFx } from "@/hooks/use-gamification-fx";
import { LessonTypeBadge, type LessonContext } from "@/components/tracks/LessonTypeBadge";
import { StepRenderer } from "@/components/lesson/StepRenderer";
import type { Step, QuizContent, TextContent, VideoContent } from "@/types/api";
import { isInteractiveStep } from "@/types/api";

function parseStepContent<T>(step: Step): T | null {
  try {
    return JSON.parse(step.content) as T;
  } catch {
    return null;
  }
}

function StepBody({ step }: { step: Step }) {
  switch (step.type) {
    case "text": {
      const c = parseStepContent<TextContent>(step);
      return (
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown>{c?.body ?? ""}</ReactMarkdown>
        </div>
      );
    }
    case "video": {
      const c = parseStepContent<VideoContent>(step);
      return (
        <div className="space-y-2">
          <div className="aspect-video w-full rounded-2xl bg-muted flex items-center justify-center border-4">
            <Play className="w-16 h-16 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            video_id: {c?.video_id ?? "—"} · {c?.duration_seconds ?? 0}s
          </p>
        </div>
      );
    }
    case "quiz": {
      const c = parseStepContent<QuizContent>(step);
      return <QuizStepBody questions={c?.questions ?? []} />;
    }
    default:
      return (
        <Card className="rounded-2xl border-4 p-6 font-medium text-muted-foreground">
          Тип шага «{step.type}» пока не поддержан в этом просмотре.
        </Card>
      );
  }
}

function QuizStepBody({ questions }: { questions: QuizContent["questions"] }) {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [revealed, setRevealed] = useState(false);

  if (questions.length === 0) {
    return <p className="text-muted-foreground font-medium">В этом квизе нет вопросов.</p>;
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <Card key={qi} className="rounded-2xl border-4 p-6 space-y-4">
          <h4 className="font-black text-lg">{qi + 1}. {q.question}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              const isCorrect = revealed && oi === q.correct_answer;
              const isWrongSelected = revealed && selected && oi !== q.correct_answer;
              return (
                <button
                  key={oi}
                  onClick={() => !revealed && setAnswers((a) => ({ ...a, [qi]: oi }))}
                  className={`p-4 rounded-2xl border-4 text-left font-bold transition ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-500/10"
                      : isWrongSelected
                        ? "border-red-500 bg-red-500/10"
                        : selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-accent/40"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {revealed && q.explanation && (
            <p className="text-sm text-muted-foreground font-medium">{q.explanation}</p>
          )}
        </Card>
      ))}
      {!revealed && (
        <Button
          onClick={() => setRevealed(true)}
          className="h-12 rounded-2xl font-bold px-6"
          disabled={Object.keys(answers).length < questions.length}
        >
          Показать ответы
        </Button>
      )}
    </div>
  );
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = (params?.id as string) ?? "";

  const { data, isLoading, error } = useLesson(lessonId);
  const completeStep = useCompleteStep();
  const submitStep = useStepSubmit();
  const fireGamificationFx = useLessonGamificationFx();

  const [index, setIndex] = useState(0);
  const [stepStartedAt, setStepStartedAt] = useState<number>(() => Date.now());

  const steps: Step[] = useMemo(() => data?.steps ?? [], [data]);
  const currentStep = steps[index];

  const context: LessonContext = useMemo(() => {
    const ls = data?.lesson;
    if (!ls) return "course";
    if (ls.is_standalone || ls.module_id === "") return "standalone";
    return "course";
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-3xl font-black">Lesson not found</h2>
        <Button asChild variant="outline" className="rounded-2xl border-4 font-bold">
          <Link href="/tracks">
            <ArrowLeft className="w-4 h-4 mr-2" />К трекам
          </Link>
        </Button>
      </div>
    );
  }

  // Переход к следующему шагу / завершение урока.
  const advance = () => {
    if (index + 1 < steps.length) {
      setIndex(index + 1);
      setStepStartedAt(Date.now());
    } else {
      toast.success("Урок пройден!");
      router.push(context === "standalone" ? "/tracks" : "/dashboard");
    }
  };

  // Legacy путь (text/video): MarkStepComplete + advance.
  const handleComplete = async () => {
    if (!currentStep) return;
    const seconds = Math.max(1, Math.round((Date.now() - stepStartedAt) / 1000));
    try {
      const resp = await completeStep.mutateAsync({
        stepId: currentStep.id,
        data: { time_spent_seconds: seconds },
      });
      // Триггерим XP/level-up/achievement/daily-goal toasts (legacy путь).
      void fireGamificationFx(resp.gamification);
      advance();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить прогресс");
    }
  };

  // Phase 2: интерактивный submit. Возвращает SubmitAnswerResponse — компонент
  // сам покажет feedback и потом дёрнет onContinue → advance().
  const handleInteractiveSubmit = async (answer: Record<string, unknown>) => {
    if (!currentStep) throw new Error("no current step");
    const timeMs = Math.max(0, Date.now() - stepStartedAt);
    const resp = await submitStep.mutateAsync({
      stepId: currentStep.id,
      body: {
        answer,
        time_spent_ms: timeMs,
        source_type: context,
      },
    });
    // gamification side-effects уже сделаны на бэке; триггерим UI.
    if (resp.is_correct) {
      void fireGamificationFx(resp.gamification);
    }
    return resp;
  };

  const lesson = data.lesson;
  const progressPct = steps.length === 0 ? 0 : Math.round(((index + 1) / steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <Button asChild variant="ghost" className="rounded-xl font-bold mb-4">
          <Link href={context === "standalone" ? "/tracks" : "/dashboard"}>
            <ArrowLeft className="w-4 h-4 mr-2" />Назад
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <LessonTypeBadge context={context} />
          {context === "standalone" && (
            <Badge variant="outline" className="rounded-full px-3 py-1 font-bold border-2 gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Без записи на курс
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black leading-tight">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-muted-foreground font-medium mt-2 max-w-3xl">{lesson.description}</p>
        )}
      </div>

      {steps.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden p-1 border-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-black text-sm tabular-nums">
            {index + 1} / {steps.length}
          </span>
        </div>
      )}

      {!currentStep ? (
        <Card className="rounded-2xl border-4 p-8 text-center text-muted-foreground font-medium">
          В этом уроке пока нет шагов.
        </Card>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="rounded-full px-3 py-1 font-bold border-2 uppercase">
              {currentStep.type}
            </Badge>
            <h2 className="text-2xl font-black">{currentStep.title}</h2>
          </div>

          {isInteractiveStep(currentStep.type) ? (
            <StepRenderer
              step={currentStep}
              onSubmit={handleInteractiveSubmit}
              onContinue={advance}
              isLast={index + 1 === steps.length}
            />
          ) : (
            <>
              <StepBody step={currentStep} />
              <div className="flex items-center justify-between gap-3 pt-4">
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl border-4 font-bold px-6"
                  disabled={index === 0}
                  onClick={() => {
                    setIndex(Math.max(0, index - 1));
                    setStepStartedAt(Date.now());
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />Назад
                </Button>

                <Button
                  onClick={handleComplete}
                  disabled={completeStep.isPending}
                  className="h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-bold shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all gap-2"
                >
                  {completeStep.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {index + 1 === steps.length ? "Завершить урок" : "Дальше"}
                  {index + 1 < steps.length && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

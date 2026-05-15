"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Play, CheckCircle2 } from "lucide-react";
import type { LessonDetails } from "@/types/api";

export function TrackLessonsList({
  lessons,
  emptyText = "В этом треке пока нет уроков",
}: {
  lessons: LessonDetails[] | undefined;
  emptyText?: string;
}) {
  if (!lessons || lessons.length === 0) {
    return (
      <Card className="rounded-2xl border-4 p-8 text-center text-muted-foreground font-medium">
        {emptyText}
      </Card>
    );
  }

  return (
    <ol className="space-y-3">
      {lessons.map((lesson, idx) => (
        <li key={lesson.id}>
          <Link
            href={`/lessons/${lesson.id}`}
            className="group flex items-center gap-4 rounded-2xl border-4 bg-card p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgba(0,0,0,0.06)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-lg">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-base sm:text-lg line-clamp-1">{lesson.title}</h4>
              {lesson.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 font-medium">{lesson.description}</p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_0_0_#46a302] group-active:translate-y-1 group-active:shadow-none transition-all">
              <Play className="w-5 h-5 fill-current" />
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

// Дополнительный вариант с маркером "пройдено", если когда-нибудь подключим прогресс на этой странице.
export function CompletedMarker() {
  return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
}

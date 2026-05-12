"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Play, ArrowRight } from "lucide-react";
import type { LessonDetails, Track } from "@/types/api";

export function DailyLessonCard({
  track,
  lesson,
}: {
  track: Track | undefined;
  lesson: LessonDetails | undefined;
}) {
  if (!lesson || !track) return null;

  return (
    <Card className="relative overflow-hidden rounded-[2rem] border-4 bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5 p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <CalendarClock className="w-8 h-8" />
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-bold uppercase tracking-wider text-xs">
              Daily
            </Badge>
            <span className="text-sm text-muted-foreground font-bold">{track.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black leading-tight">{lesson.title}</h2>
          {lesson.description && (
            <p className="text-muted-foreground font-medium line-clamp-2">{lesson.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <Button
            asChild
            size="lg"
            className="h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 text-base font-bold shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all"
          >
            <Link href={`/lessons/${lesson.id}`} className="gap-2">
              <Play className="w-5 h-5 fill-current" />
              Начать
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 rounded-2xl border-4 px-6 font-bold gap-1"
          >
            <Link href={`/tracks/${track.code || track.id}`}>
              К треку
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

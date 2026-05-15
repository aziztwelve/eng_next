"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useTrack } from "@/hooks/use-tracks";
import { TrackLessonsList } from "@/components/tracks/TrackLessonsList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Compass, Loader2 } from "lucide-react";

export default function TrackDetailPage() {
  const params = useParams();
  const idOrCode = (params?.id as string) ?? "";

  const { data: track, isLoading, error } = useTrack(idOrCode, true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-3xl font-black">Track not found</h2>
        <Button asChild variant="outline" className="rounded-2xl border-4 font-bold">
          <Link href="/tracks">
            <ArrowLeft className="w-4 h-4 mr-2" />К трекам
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div>
        <Button asChild variant="ghost" className="rounded-xl font-bold mb-4">
          <Link href="/tracks">
            <ArrowLeft className="w-4 h-4 mr-2" />К трекам
          </Link>
        </Button>

        <Card className="rounded-[2rem] border-4 overflow-hidden">
          {track.icon_url && (
            <div
              className="h-48 sm:h-64 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${track.icon_url})` }}
            />
          )}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full px-3 py-1 font-bold uppercase border-2 bg-secondary/20 text-secondary border-secondary/30 gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                {track.track_type}
              </Badge>
              {track.language && (
                <Badge variant="outline" className="rounded-full px-3 py-1 font-bold border-2 uppercase">
                  {track.language}
                </Badge>
              )}
              {track.level && (
                <Badge variant="outline" className="rounded-full px-3 py-1 font-bold border-2">
                  {track.level}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">{track.title}</h1>
            {track.description && (
              <p className="text-lg text-muted-foreground font-medium max-w-3xl">{track.description}</p>
            )}
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-black">Уроки</h2>
          <span className="text-sm text-muted-foreground font-bold">
            {track.lessons?.length ?? 0} шт.
          </span>
        </div>
        <TrackLessonsList lessons={track.lessons} />
      </section>
    </div>
  );
}

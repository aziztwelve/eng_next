"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Track } from "@/types/api";

export function TrackCard({ track }: { track: Track }) {
  return (
    <Link href={`/tracks/${track.code || track.id}`} className="group block">
      <Card className="h-full rounded-3xl border-4 bg-card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_10px_0_0_rgba(0,0,0,0.08)] shadow-[0_6px_0_0_rgba(0,0,0,0.06)]">
        {track.icon_url ? (
          <div
            className="h-32 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${track.icon_url})` }}
          />
        ) : (
          <div className="h-32 w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
        )}

        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
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

          <h3 className="text-xl font-black leading-tight line-clamp-2">{track.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 font-medium">{track.description}</p>

          <div className="flex items-center justify-end pt-2 text-primary font-bold text-sm gap-1 group-hover:gap-2 transition-all">
            Open
            <ArrowRight className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

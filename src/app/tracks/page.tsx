"use client";

import { useState } from "react";
import { useTracks } from "@/hooks/use-tracks";
import { TrackCard } from "@/components/tracks/TrackCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Compass, Loader2, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function TracksPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useTracks({
    search: search || undefined,
    limit: 60,
  });

  const tracks = data?.tracks ?? [];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-sm font-bold text-secondary border border-secondary/30">
            <Compass className="w-4 h-4" />
            {t("common.explore_tracks")}
          </div>
          <h1 className="text-4xl font-black">{t("common.tracks")}</h1>
          <p className="text-muted-foreground font-medium max-w-xl">
            Короткие тематические подборки уроков. Можно проходить без записи на курс.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            className="pl-12 h-14 bg-card border-4 rounded-2xl focus-visible:ring-primary font-bold text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="rounded-2xl border-4 p-8 text-center font-medium">
          Не удалось загрузить треки. Попробуй обновить страницу.
        </Card>
      )}

      {!isLoading && !error && tracks.length === 0 && (
        <Card className="rounded-2xl border-4 p-8 text-center text-muted-foreground font-medium">
          Пока нет публичных треков.
        </Card>
      )}

      {!isLoading && tracks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUp, ArrowDown, Crown, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsAuthenticated } from "@/hooks/use-auth";
import { useMyLeague, useMyLeaderboard } from "@/hooks/use-leagues";
import { tsToDate } from "@/lib/gamification-api";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Компактный баннер-карточка моей лиги для главной (Phase 4.5).
 *
 * Бесшумно скрывается если:
 *   - юзер не авторизован
 *   - social-service недоступен (queries в error/loading)
 *   - my_league ещё не создан (rank == 0 без entries)
 *
 * Подсвечивает promotion-зону (топ N) и demotion-зону (низ M)
 * чтобы юзер с одного взгляда понимал, в какую сторону его несёт.
 */
export function LeagueBanner() {
  const { isAuthenticated } = useIsAuthenticated();
  const myLeague = useMyLeague();
  const board = useMyLeaderboard();
  const { t } = useLanguage();

  if (!isAuthenticated) return null;
  if (myLeague.isLoading || board.isLoading) return null;
  if (myLeague.isError && board.isError) return null;

  const league = board.data?.league ?? myLeague.data?.user_league.league;
  if (!league) return null;

  const myRank =
    board.data?.my_rank ?? myLeague.data?.user_league.rank_in_cohort ?? 0;
  const myXP =
    board.data?.my_weekly_xp ?? myLeague.data?.user_league.weekly_xp ?? 0;
  const cycleEnd = board.data?.cycle_end_at ?? myLeague.data?.cycle_end_at;
  const cohortSize = board.data?.entries.length ?? 0;
  const promotionCount = board.data?.promotion_count ?? 0;
  const demotionCount = board.data?.demotion_count ?? 0;

  // Юзер ещё ни разу не получил XP в текущем цикле — баннер ради баннера
  // показывать смысла мало, но league всё-таки есть, так что покажем без zone.
  const inPromotion =
    myRank > 0 && promotionCount > 0 && myRank <= promotionCount;
  const inDemotion =
    myRank > 0 &&
    demotionCount > 0 &&
    cohortSize > 0 &&
    myRank > cohortSize - demotionCount;

  const accent = league.color || "#CD7F32";

  return (
    <Card
      className="relative overflow-hidden rounded-[2rem] border-4 p-5 sm:p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.08)]"
      style={{ borderColor: accent }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${accent} 0%, transparent 60%)`,
        }}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4"
          style={{ borderColor: accent, backgroundColor: `${accent}22` }}
        >
          <Crown className="h-8 w-8" style={{ color: accent }} />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className="rounded-full px-3 py-1 font-bold uppercase tracking-wider text-xs text-white"
              style={{ backgroundColor: accent }}
            >
              <Trophy className="h-3 w-3 mr-1 inline-block" />
              {t("common.leagues", "Лиги")}
            </Badge>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tier {league.tier}
            </span>
            {inPromotion && (
              <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 border-2 border-emerald-400/60 font-bold text-xs px-2 py-0.5">
                <ArrowUp className="h-3 w-3 mr-1" />
                {t("leagues.zonePromotion", "Промо-зона")}
              </Badge>
            )}
            {inDemotion && (
              <Badge className="rounded-full bg-rose-500/15 text-rose-700 border-2 border-rose-400/60 font-bold text-xs px-2 py-0.5">
                <ArrowDown className="h-3 w-3 mr-1" />
                {t("leagues.zoneDemotion", "Зона риска")}
              </Badge>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black leading-tight truncate">
            {league.name}
          </h3>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <RankPill rank={myRank} t={t} />
            <XPPill xp={myXP} t={t} />
            <CycleTimer endsAt={cycleEnd} t={t} />
          </div>
        </div>

        <Button
          asChild
          className={cn(
            "h-12 rounded-2xl font-black px-5 shrink-0",
            "shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-1 active:shadow-none transition-all",
          )}
          style={{ backgroundColor: accent, color: "#fff" }}
        >
          <Link href="/leagues" className="gap-2">
            {t("leagues.openCta", "Открыть лигу")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function RankPill({
  rank,
  t,
}: {
  rank: number;
  t: (path: string, fallback?: string) => string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {t("leagues.myRank", "Место")}
      </span>
      <span className="text-2xl font-black tabular-nums leading-none mt-1">
        {rank > 0 ? `#${rank}` : "—"}
      </span>
    </div>
  );
}

function XPPill({
  xp,
  t,
}: {
  xp: number;
  t: (path: string, fallback?: string) => string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {t("leagues.weeklyXP", "XP за неделю")}
      </span>
      <span className="text-2xl font-black tabular-nums leading-none mt-1 text-primary">
        {xp.toLocaleString("ru")}
      </span>
    </div>
  );
}

function CycleTimer({
  endsAt,
  t,
}: {
  endsAt?: string;
  t: (path: string, fallback?: string) => string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000 * 60);
    return () => clearInterval(id);
  }, []);

  const remaining = useMemo(() => {
    if (!endsAt) return null;
    const end = tsToDate(endsAt);
    if (!end) return null;
    const ms = end.getTime() - now;
    if (ms <= 0) return { d: 0, h: 0, ended: true };
    const totalMin = Math.floor(ms / 60000);
    const d = Math.floor(totalMin / (60 * 24));
    const h = Math.floor((totalMin / 60) % 24);
    return { d, h, ended: false };
  }, [endsAt, now]);

  if (!remaining) return null;

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {t("leagues.cycleEnds", "До конца цикла")}
      </span>
      <span
        className={cn(
          "text-2xl font-black tabular-nums leading-none mt-1",
          remaining.ended ? "text-amber-600" : "text-foreground",
        )}
      >
        {remaining.ended
          ? t("leagues.cycleEnding", "скоро")
          : `${remaining.d}д ${remaining.h}ч`}
      </span>
    </div>
  );
}

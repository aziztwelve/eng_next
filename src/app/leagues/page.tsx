'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Crown,
  History,
  Loader2,
  Medal,
  Trophy,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMyLeaderboard, useMyLeague } from '@/hooks/use-leagues';
import { tsToDate } from '@/lib/gamification-api';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/api';

/**
 * /leagues — главный экран лиг.
 *
 * Композиция:
 *   1. Hero — текущая лига + цикл-таймер + my rank + my XP
 *   2. Promotion/demotion zone подсказки
 *   3. Leaderboard (топ 30 моей когорты с zone-разметкой)
 *
 * Backend:
 *   GET /api/v1/leagues/mine             → моя лига + cohort + rank
 *   GET /api/v1/leagues/mine/leaderboard → топ 30
 *
 * Гейтвэй автоматически делает `EnsureUserInLeague` перед чтением,
 * поэтому новый юзер сразу попадёт в Bronze когорту без явного действия.
 */
export default function LeaguesPage() {
  const myLeague = useMyLeague();
  const board = useMyLeaderboard();

  const isLoading = myLeague.isLoading || board.isLoading;
  const isError = myLeague.isError && board.isError;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="rounded-3xl border-4 p-8 text-center space-y-3">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-black">Лиги ещё недоступны</h2>
          <p className="text-muted-foreground font-medium">
            Похоже, social-service не отвечает. Попробуйте позже.
          </p>
        </Card>
      </div>
    );
  }

  const league = board.data?.league ?? myLeague.data?.user_league.league;
  const entries = board.data?.entries ?? [];
  const cycleEnd = board.data?.cycle_end_at ?? myLeague.data?.cycle_end_at;

  // Берём rank/XP из leaderboard (свежее из Redis), fallback на myLeague.
  const myRank =
    board.data?.my_rank ??
    myLeague.data?.user_league.rank_in_cohort ??
    0;
  const myXP =
    board.data?.my_weekly_xp ?? myLeague.data?.user_league.weekly_xp ?? 0;

  const promotionCount = board.data?.promotion_count ?? 0;
  const demotionCount = board.data?.demotion_count ?? 0;
  const totalInCohort = entries.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500" />
            Лиги
          </h1>
          <p className="text-muted-foreground font-medium mt-2">
            Соревнуйтесь в когорте из 30 человек. Топ 7 → новая лига,
            низ 5 → старая. Цикл — неделя по UTC.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-2xl border-2">
          <Link href="/leagues/history">
            <History className="h-4 w-4 mr-2" />
            История
          </Link>
        </Button>
      </div>

      <Hero
        league={league}
        cycleEndAt={cycleEnd}
        myRank={myRank}
        myXP={myXP}
        cohortSize={totalInCohort}
      />

      {(promotionCount > 0 || demotionCount > 0) && (
        <ZoneHints
          promotionCount={promotionCount}
          demotionCount={demotionCount}
          cohortSize={totalInCohort > 0 ? totalInCohort : 30}
        />
      )}

      <Leaderboard
        entries={entries}
        promotionCount={promotionCount}
        demotionCount={demotionCount}
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Hero
// ----------------------------------------------------------------------------

function Hero({
  league,
  cycleEndAt,
  myRank,
  myXP,
  cohortSize,
}: {
  league?: {
    name: string;
    color: string;
    tier: number;
    icon_url?: string;
  };
  cycleEndAt?: string;
  myRank: number;
  myXP: number;
  cohortSize: number;
}) {
  const accent = league?.color || '#CD7F32';
  return (
    <Card
      className="rounded-3xl border-4 p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.1)]"
      style={{ borderColor: accent }}
    >
      <div className="grid sm:grid-cols-[auto_1fr_auto] gap-6 items-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-3xl border-4"
          style={{ borderColor: accent, backgroundColor: `${accent}22` }}
        >
          <Crown className="h-12 w-12" style={{ color: accent }} />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tier {league?.tier ?? '—'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            {league?.name ?? 'Bronze League'}
          </h2>
          <p className="text-muted-foreground font-medium text-sm">
            В когорте из {cohortSize || 30} человек
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Ваше место
          </div>
          <div className="text-4xl font-black tabular-nums">
            #{myRank || '—'}
          </div>
          <div className="text-sm font-bold text-primary tabular-nums">
            {myXP.toLocaleString('ru')} XP
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t-2 border-dashed flex items-center justify-between gap-3 flex-wrap">
        <CycleTimer endsAt={cycleEndAt} />
      </div>
    </Card>
  );
}

function CycleTimer({ endsAt }: { endsAt?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const remaining = useMemo(() => {
    if (!endsAt) return null;
    const end = tsToDate(endsAt);
    if (!end) return null;
    const ms = end.getTime() - now;
    if (ms <= 0) return { d: 0, h: 0, m: 0, ended: true };
    const totalMin = Math.floor(ms / 60000);
    const d = Math.floor(totalMin / (60 * 24));
    const h = Math.floor((totalMin / 60) % 24);
    const m = totalMin % 60;
    return { d, h, m, ended: false };
  }, [endsAt, now]);

  if (!remaining) {
    return (
      <span className="text-sm text-muted-foreground font-medium">
        Цикл активен
      </span>
    );
  }
  if (remaining.ended) {
    return (
      <span className="text-sm font-bold text-amber-600">
        Подведение итогов скоро…
      </span>
    );
  }
  return (
    <span className="text-sm font-bold tabular-nums">
      До конца цикла: {remaining.d}д {remaining.h}ч {remaining.m}м
    </span>
  );
}

// ----------------------------------------------------------------------------
// Zone hints
// ----------------------------------------------------------------------------

function ZoneHints({
  promotionCount,
  demotionCount,
  cohortSize,
}: {
  promotionCount: number;
  demotionCount: number;
  cohortSize: number;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {promotionCount > 0 && (
        <Card className="rounded-2xl border-4 border-emerald-400/60 bg-emerald-500/5 p-4 flex items-center gap-3">
          <ArrowUp className="h-6 w-6 text-emerald-600 shrink-0" />
          <div className="text-sm">
            <div className="font-black text-emerald-700">
              Промо-зона: топ {promotionCount}
            </div>
            <div className="text-muted-foreground font-medium">
              Места 1–{promotionCount} переходят в следующую лигу
            </div>
          </div>
        </Card>
      )}
      {demotionCount > 0 && (
        <Card className="rounded-2xl border-4 border-rose-400/60 bg-rose-500/5 p-4 flex items-center gap-3">
          <ArrowDown className="h-6 w-6 text-rose-600 shrink-0" />
          <div className="text-sm">
            <div className="font-black text-rose-700">
              Зона риска: низ {demotionCount}
            </div>
            <div className="text-muted-foreground font-medium">
              Места {cohortSize - demotionCount + 1}–{cohortSize} опустятся в
              предыдущую лигу
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Leaderboard
// ----------------------------------------------------------------------------

function Leaderboard({
  entries,
  promotionCount,
  demotionCount,
}: {
  entries: LeaderboardEntry[];
  promotionCount: number;
  demotionCount: number;
}) {
  if (entries.length === 0) {
    return (
      <Card className="rounded-3xl border-4 p-8 text-center">
        <p className="text-muted-foreground font-medium">
          Когорта пока пуста. Получите XP, чтобы появиться на доске!
        </p>
      </Card>
    );
  }
  const cohortSize = entries.length;
  return (
    <Card className="rounded-3xl border-4 overflow-hidden">
      <div className="px-6 py-4 border-b-2 bg-muted/30 font-black text-lg">
        Топ когорты
      </div>
      <ul>
        {entries.map((e, idx) => (
          <LeaderboardRow
            key={e.user_id}
            entry={e}
            isPromotion={e.rank <= promotionCount && promotionCount > 0}
            isDemotion={
              demotionCount > 0 && e.rank > cohortSize - demotionCount
            }
            isLast={idx === entries.length - 1}
          />
        ))}
      </ul>
    </Card>
  );
}

function LeaderboardRow({
  entry,
  isPromotion,
  isDemotion,
  isLast,
}: {
  entry: LeaderboardEntry;
  isPromotion: boolean;
  isDemotion: boolean;
  isLast: boolean;
}) {
  const isTop3 = entry.rank <= 3;
  const initial =
    entry.full_name?.slice(0, 1).toUpperCase() ||
    entry.user_id.slice(0, 1).toUpperCase();
  const name = entry.full_name || `User ${entry.user_id.slice(0, 6)}`;

  return (
    <li
      className={cn(
        'flex items-center gap-4 px-6 py-3 transition-colors',
        !isLast && 'border-b',
        entry.is_me && 'bg-primary/10',
        isPromotion && !entry.is_me && 'bg-emerald-500/5',
        isDemotion && !entry.is_me && 'bg-rose-500/5',
      )}
    >
      <div className="w-10 shrink-0 flex items-center justify-center">
        {isTop3 ? (
          <Medal
            className={cn(
              'h-6 w-6',
              entry.rank === 1 && 'text-amber-500',
              entry.rank === 2 && 'text-slate-400',
              entry.rank === 3 && 'text-amber-700',
            )}
          />
        ) : (
          <span className="text-lg font-black tabular-nums text-muted-foreground">
            {entry.rank}
          </span>
        )}
      </div>

      <Avatar className="h-10 w-10 shrink-0 border-2">
        {entry.avatar_url && (
          <AvatarImage src={entry.avatar_url} alt={name} />
        )}
        <AvatarFallback className="font-black">{initial}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="font-bold truncate flex items-center gap-2">
          {name}
          {entry.is_me && (
            <Badge className="rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              Вы
            </Badge>
          )}
        </div>
      </div>

      <div className="font-black tabular-nums">
        {entry.weekly_xp.toLocaleString('ru')}{' '}
        <span className="text-xs text-muted-foreground font-bold">XP</span>
      </div>
    </li>
  );
}

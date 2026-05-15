'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Gem,
  History,
  Loader2,
  Minus,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLeagueHistory, useLeaguesCatalog } from '@/hooks/use-leagues';
import { tsToDate } from '@/lib/gamification-api';
import { cn } from '@/lib/utils';
import type { League, LeagueHistoryEntry } from '@/types/api';

const PAGE_SIZE = 20;

/**
 * /leagues/history — история выступлений в лигах с пагинацией.
 *
 * Каждая запись = (user, week). Содержит финальный rank, XP,
 * promotion/demotion флаги и заработанные gems.
 */
export default function LeagueHistoryPage() {
  const [offset, setOffset] = useState(0);

  const history = useLeagueHistory({ limit: PAGE_SIZE, offset });
  const catalog = useLeaguesCatalog();

  const leaguesById = new Map<number, League>();
  for (const l of catalog.data?.leagues ?? []) {
    leaguesById.set(l.id, l);
  }

  const entries = history.data?.entries ?? [];
  const total = history.data?.total ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Button
            asChild
            variant="ghost"
            className="rounded-xl -ml-2 mb-2 h-8 px-3 text-muted-foreground"
          >
            <Link href="/leagues">
              <ArrowLeft className="h-4 w-4 mr-1" />К лигам
            </Link>
          </Button>
          <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            История лиг
          </h1>
          <p className="text-muted-foreground font-medium mt-2">
            Все ваши еженедельные итоги: финальное место, заработанные XP и
            gems, переходы между лигами.
          </p>
        </div>
      </div>

      {history.isLoading ? (
        <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : entries.length === 0 ? (
        <Card className="rounded-3xl border-4 p-8 text-center space-y-2">
          <History className="h-10 w-10 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-black">Истории пока нет</h2>
          <p className="text-muted-foreground font-medium">
            Завершите первый еженедельный цикл, и итог появится здесь.
          </p>
        </Card>
      ) : (
        <>
          <ul className="space-y-3">
            {entries.map((e) => (
              <HistoryRow
                key={e.id}
                entry={e}
                league={leaguesById.get(e.league_id)}
              />
            ))}
          </ul>

          <Pagination
            total={total}
            offset={offset}
            pageSize={PAGE_SIZE}
            onChange={setOffset}
          />
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Row
// ----------------------------------------------------------------------------

function HistoryRow({
  entry,
  league,
}: {
  entry: LeagueHistoryEntry;
  league?: League;
}) {
  const accent = league?.color || '#94a3b8';
  const startDate = tsToDate(entry.cycle_start_at);
  const endDate = tsToDate(entry.cycle_end_at);

  return (
    <li>
      <Card
        className={cn(
          'rounded-2xl border-4 p-4 transition-shadow hover:shadow-md',
        )}
        style={{ borderColor: accent + '88' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 shrink-0 font-black text-lg tabular-nums"
            style={{
              borderColor: accent,
              backgroundColor: `${accent}22`,
              color: accent,
            }}
          >
            #{entry.final_rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-black text-lg flex items-center gap-2 flex-wrap">
              {league?.name ?? `League ${entry.league_id}`}
              <Outcome
                promoted={entry.promoted}
                demoted={entry.demoted}
              />
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">
              {formatPeriod(startDate, endDate)}
            </div>
          </div>

          <div className="text-right space-y-1 shrink-0">
            <div className="font-black tabular-nums text-base">
              {entry.final_xp.toLocaleString('ru')}{' '}
              <span className="text-xs text-muted-foreground font-bold">
                XP
              </span>
            </div>
            {entry.gems_earned > 0 && (
              <div className="flex items-center justify-end gap-1 text-sm font-bold text-cyan-600">
                <Gem className="h-3.5 w-3.5" />+{entry.gems_earned}
              </div>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}

function Outcome({
  promoted,
  demoted,
}: {
  promoted: boolean;
  demoted: boolean;
}) {
  if (promoted) {
    return (
      <Badge className="rounded-lg bg-emerald-500 text-white font-bold gap-1">
        <ArrowUp className="h-3 w-3" />
        Промо
      </Badge>
    );
  }
  if (demoted) {
    return (
      <Badge className="rounded-lg bg-rose-500 text-white font-bold gap-1">
        <ArrowDown className="h-3 w-3" />
        Демо
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="rounded-lg font-bold text-muted-foreground gap-1 border-2"
    >
      <Minus className="h-3 w-3" />
      Остались
    </Badge>
  );
}

function formatPeriod(start: Date | null, end: Date | null): string {
  if (!start || !end) return '';
  const fmt = new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'short',
  });
  const year = end.getFullYear();
  return `${fmt.format(start)} – ${fmt.format(end)} ${year}`;
}

// ----------------------------------------------------------------------------
// Pagination
// ----------------------------------------------------------------------------

function Pagination({
  total,
  offset,
  pageSize,
  onChange,
}: {
  total: number;
  offset: number;
  pageSize: number;
  onChange: (next: number) => void;
}) {
  const page = Math.floor(offset / pageSize) + 1;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = offset > 0;
  const canNext = offset + pageSize < total;

  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        className="rounded-xl border-2"
        disabled={!canPrev}
        onClick={() => onChange(Math.max(0, offset - pageSize))}
      >
        ← Назад
      </Button>
      <div className="text-sm font-medium text-muted-foreground tabular-nums">
        Страница {page} из {pages}
      </div>
      <Button
        variant="outline"
        className="rounded-xl border-2"
        disabled={!canNext}
        onClick={() => onChange(offset + pageSize)}
      >
        Вперёд →
      </Button>
    </div>
  );
}

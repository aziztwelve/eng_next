'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, Medal, Trophy, Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFriendsLeaderboard } from '@/hooks/use-friends';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { LeaderboardFriendEntry } from '@/types/api';

/**
 * /friends/leaderboard — leaderboard среди друзей + self.
 *
 * Backend: GET /api/v1/friends/leaderboard?limit=
 *   sort: weekly_xp DESC, ranks 1..N. Включает self.
 */
export default function FriendsLeaderboardPage() {
  const { t } = useLanguage();
  const board = useFriendsLeaderboard();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Button asChild variant="ghost" className="rounded-xl font-bold w-fit">
        <Link href="/friends">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('friends.leaderboard.backToFriends')}
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <Trophy className="h-8 w-8 text-amber-500" />
          {t('friends.leaderboard.title')}
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          {t('friends.leaderboard.subtitle')}
        </p>
      </div>

      {board.isLoading ? (
        <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </Card>
      ) : (
        <Leaderboard entries={board.data?.entries ?? []} />
      )}
    </div>
  );
}

function Leaderboard({ entries }: { entries: LeaderboardFriendEntry[] }) {
  const { t } = useLanguage();
  if (entries.length === 0) {
    return (
      <Card className="rounded-3xl border-4 p-8 text-center space-y-2">
        <Users className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="font-black text-xl">{t('friends.leaderboard.emptyTitle')}</h2>
        <p className="text-sm text-muted-foreground font-medium">
          {t('friends.leaderboard.emptyText')}
        </p>
        <Button asChild className="rounded-xl font-bold mt-3">
          <Link href="/friends">{t('friends.leaderboard.findCta')}</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-4 divide-y-2 overflow-hidden">
      {entries.map((e) => (
        <Row key={e.user_id} entry={e} />
      ))}
    </Card>
  );
}

function Row({ entry: e }: { entry: LeaderboardFriendEntry }) {
  const { t, language } = useLanguage();
  const isTop3 = e.rank <= 3;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4',
        e.is_me && 'bg-primary/5',
      )}
    >
      <RankBadge rank={e.rank} highlight={isTop3} />

      <Avatar className="h-11 w-11 border-2">
        <AvatarImage src={e.avatar_url || undefined} alt={e.username} />
        <AvatarFallback>{initials(e)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="font-bold truncate flex items-center gap-2">
          {displayName(e)}
          {e.is_me && (
            <span className="text-xs font-black text-primary">{t('friends.leaderboard.youSuffix')}</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {e.username ? `@${e.username}` : '—'}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-black tabular-nums">
          {e.weekly_xp.toLocaleString(language === 'en' ? 'en' : 'ru')}
        </div>
        <div className="text-xs text-muted-foreground font-medium">XP</div>
      </div>
    </div>
  );
}

function RankBadge({ rank, highlight }: { rank: number; highlight: boolean }) {
  if (highlight) {
    const color =
      rank === 1
        ? 'text-amber-500'
        : rank === 2
          ? 'text-slate-400'
          : 'text-orange-500';
    return (
      <div className="flex h-10 w-10 items-center justify-center shrink-0">
        <Medal className={cn('h-7 w-7', color)} />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 font-black tabular-nums shrink-0">
      {rank}
    </div>
  );
}

function displayName(e: LeaderboardFriendEntry) {
  if (e.full_name) return e.full_name;
  if (e.username) return e.username;
  return e.user_id.slice(0, 8);
}

function initials(e: LeaderboardFriendEntry) {
  const src = e.full_name || e.username || '?';
  const parts = src.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

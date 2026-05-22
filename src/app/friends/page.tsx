'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Check,
  Loader2,
  Search,
  Trophy,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAcceptFriendRequest,
  useFriends,
  useFriendsSearch,
  usePendingFriends,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
} from '@/hooks/use-friends';
import { useLanguage } from '@/lib/i18n';
import { friendshipStatusToShort, type FriendInfo } from '@/types/api';

/**
 * /friends — главный экран Friends.
 *
 * Tabs:
 *   1. Friends — accepted-друзья (mineGT enriched: avatar / username / xp).
 *   2. Pending — incoming + outgoing запросы.
 *   3. Search  — поиск по username (debounced) + кнопка «Add».
 *
 * Backend: gateway /api/v1/friends/* — auth required.
 */
export default function FriendsPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'friends' | 'pending' | 'search'>('friends');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            {t('friends.page.title')}
          </h1>
          <p className="text-muted-foreground font-medium mt-2">
            {t('friends.page.subtitle')}
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-2xl border-2">
          <Link href="/friends/leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            {t('friends.page.leaderboardBtn')}
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="rounded-2xl border-2 p-1 bg-muted/40 w-full sm:w-auto">
          <TabsTrigger value="friends" className="rounded-xl font-bold">
            {t('friends.page.tabFriends')}
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl font-bold">
            {t('friends.page.tabPending')}
          </TabsTrigger>
          <TabsTrigger value="search" className="rounded-xl font-bold">
            {t('friends.page.tabSearch')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4">
          <FriendsListTab />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <PendingTab />
        </TabsContent>
        <TabsContent value="search" className="mt-4">
          <SearchTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Friends list tab
// ============================================================================

function FriendsListTab() {
  const { t } = useLanguage();
  const friends = useFriends();
  const remove = useRemoveFriend();

  if (friends.isLoading) return <LoadingCard />;

  const list = friends.data?.friends ?? [];
  if (list.length === 0) {
    return (
      <EmptyCard
        title={t('friends.list.emptyTitle')}
        text={t('friends.list.emptyText')}
      />
    );
  }

  const onRemove = async (f: FriendInfo) => {
    if (!confirm(t('friends.list.removeConfirm').replace('{name}', friendDisplayName(f)))) return;
    try {
      await remove.mutateAsync(f.user_id);
      toast.success(t('friends.list.removeSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('friends.list.removeFail'));
    }
  };

  return (
    <Card className="rounded-3xl border-4 divide-y-2">
      {list.map((f) => (
        <FriendRow
          key={f.user_id}
          friend={f}
          right={
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemove(f)}
              disabled={remove.isPending}
              className="rounded-xl font-bold"
            >
              <UserMinus className="h-4 w-4 mr-1" />
              {t('friends.list.removeBtn')}
            </Button>
          }
        />
      ))}
    </Card>
  );
}

// ============================================================================
// Pending tab (incoming + outgoing)
// ============================================================================

function PendingTab() {
  const { t } = useLanguage();
  const pending = usePendingFriends();
  const accept = useAcceptFriendRequest();
  const reject = useRejectFriendRequest();

  if (pending.isLoading) return <LoadingCard />;

  const list = pending.data?.requests ?? [];
  if (list.length === 0) {
    return <EmptyCard title={t('friends.pending.emptyTitle')} text={t('friends.pending.emptyText')} />;
  }

  const incoming = list.filter((r) => r.is_incoming);
  const outgoing = list.filter((r) => !r.is_incoming);

  const onAccept = async (f: FriendInfo) => {
    try {
      await accept.mutateAsync(f.friendship_id);
      toast.success(t('friends.pending.acceptedToast').replace('{name}', friendDisplayName(f)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('friends.pending.acceptFail'));
    }
  };

  const onReject = async (f: FriendInfo) => {
    try {
      await reject.mutateAsync(f.friendship_id);
      toast.success(t('friends.pending.rejectedToast'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('friends.pending.rejectFail'));
    }
  };

  return (
    <div className="space-y-4">
      {incoming.length > 0 && (
        <Card className="rounded-3xl border-4 overflow-hidden">
          <SectionHeader title={t('friends.pending.incoming')} count={incoming.length} />
          <div className="divide-y-2">
            {incoming.map((f) => (
              <FriendRow
                key={f.friendship_id}
                friend={f}
                right={
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAccept(f)}
                      disabled={accept.isPending}
                      className="rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {t('friends.pending.accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReject(f)}
                      disabled={reject.isPending}
                      className="rounded-xl font-bold"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t('friends.pending.reject')}
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        </Card>
      )}

      {outgoing.length > 0 && (
        <Card className="rounded-3xl border-4 overflow-hidden">
          <SectionHeader title={t('friends.pending.outgoing')} count={outgoing.length} />
          <div className="divide-y-2">
            {outgoing.map((f) => (
              <FriendRow
                key={f.friendship_id}
                friend={f}
                right={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(f)}
                    disabled={reject.isPending}
                    className="rounded-xl font-bold"
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t('friends.pending.cancel')}
                  </Button>
                }
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Search tab
// ============================================================================

function SearchTab() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  // Debounce 250ms — не дёргаем backend на каждый ввод.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useFriendsSearch(debounced);
  const sendReq = useSendFriendRequest();

  const onSend = async (f: FriendInfo) => {
    try {
      const resp = await sendReq.mutateAsync(f.user_id);
      if (resp.auto_accepted) {
        toast.success(t('friends.search.autoAcceptedToast').replace('{name}', friendDisplayName(f)));
      } else {
        toast.success(t('friends.search.sentToast'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('friends.search.sendFail'));
    }
  };

  const list = results.data?.users ?? [];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={t('friends.search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 rounded-2xl border-2 h-12 font-medium"
        />
      </div>

      {debounced.trim().length < 2 ? (
        <EmptyCard
          title={t('friends.search.minCharsTitle')}
          text={t('friends.search.minCharsText')}
        />
      ) : results.isLoading ? (
        <LoadingCard />
      ) : list.length === 0 ? (
        <EmptyCard
          title={t('friends.search.noResultsTitle')}
          text={t('friends.search.noResultsText').replace('{q}', debounced)}
        />
      ) : (
        <Card className="rounded-3xl border-4 divide-y-2">
          {list.map((f) => (
            <FriendRow
              key={f.user_id}
              friend={f}
              right={<SearchResultAction friend={f} onSend={onSend} pending={sendReq.isPending} />}
            />
          ))}
        </Card>
      )}
    </div>
  );
}

function SearchResultAction({
  friend,
  onSend,
  pending,
}: {
  friend: FriendInfo;
  onSend: (f: FriendInfo) => void;
  pending: boolean;
}) {
  const { t } = useLanguage();
  const status = friendshipStatusToShort(friend.friendship_status);

  if (status === 'accepted') {
    return (
      <Badge variant="outline" className="rounded-xl font-bold">
        <Check className="h-3 w-3 mr-1" />
        {t('friends.search.statusFriends')}
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="outline" className="rounded-xl font-bold">
        {friend.is_incoming
          ? t('friends.search.statusPendingIncoming')
          : t('friends.search.statusPendingOutgoing')}
      </Badge>
    );
  }
  if (status === 'blocked') {
    return (
      <Badge variant="outline" className="rounded-xl font-bold text-rose-600">
        {t('friends.search.statusBlocked')}
      </Badge>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => onSend(friend)}
      disabled={pending}
      className="rounded-xl font-bold"
    >
      <UserPlus className="h-4 w-4 mr-1" />
      {t('friends.search.addBtn')}
    </Button>
  );
}

// ============================================================================
// Shared row + states
// ============================================================================

function FriendRow({
  friend,
  right,
}: {
  friend: FriendInfo;
  right?: React.ReactNode;
}) {
  const { t, language } = useLanguage();
  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar className="h-12 w-12 border-2">
        <AvatarImage src={friend.avatar_url || undefined} alt={friend.username} />
        <AvatarFallback>{friendInitials(friend)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{friendDisplayName(friend)}</div>
        <div className="text-xs text-muted-foreground truncate">
          {friend.username ? `@${friend.username}` : t('friends.row.noUsername')}
          {friend.weekly_xp > 0
            ? t('friends.row.weeklyXpSuffix').replace(
                '{xp}',
                friend.weekly_xp.toLocaleString(language === 'en' ? 'en' : 'ru'),
              )
            : ''}
        </div>
      </div>

      {right}
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
      <h3 className="font-black">{title}</h3>
      <Badge variant="outline" className="rounded-xl">{count}</Badge>
    </div>
  );
}

function LoadingCard() {
  return (
    <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </Card>
  );
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <Card className="rounded-3xl border-4 p-8 text-center space-y-2">
      <h3 className="font-black text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground font-medium">{text}</p>
    </Card>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function friendDisplayName(f: FriendInfo) {
  if (f.full_name) return f.full_name;
  if (f.username) return f.username;
  return f.user_id.slice(0, 8);
}

function friendInitials(f: FriendInfo) {
  const src = f.full_name || f.username || '?';
  const parts = src.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

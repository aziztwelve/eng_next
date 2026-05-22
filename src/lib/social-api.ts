import { ApiClient } from './api-client';
import type {
  AcceptFriendRequestResponse,
  GetFriendsLeaderboardResponse,
  GetLeagueHistoryResponse,
  GetMyLeaderboardResponse,
  GetMyLeagueResponse,
  LeaderboardEntry,
  LeaderboardFriendEntry,
  ListFriendsResponse,
  ListLeaguesResponse,
  ListPendingRequestsResponse,
  PendingDirection,
  SearchFriendsResponse,
  SendFriendRequestResponse,
} from '@/types/api';

/**
 * Backend сериализует ответы через protojson, а в proto3 zero-value поля
 * (`weekly_xp = 0`, `rank = 0`, etc.) опускаются из JSON. На клиенте это
 * вылазит как `undefined.toLocaleString()` → runtime crash.
 *
 * Поэтому нормализуем числовые поля сразу на границе API: всем потребителям
 * (LeagueBanner, /leagues, /leagues/history) гарантируем `number` вместо
 * `number | undefined`. Тип в `api.ts` уже описывает поле как `number` — это
 * лишь приведение в соответствие.
 */
function normalizeLeaderboardEntry(e: LeaderboardEntry): LeaderboardEntry {
  return {
    ...e,
    rank: e.rank ?? 0,
    weekly_xp: e.weekly_xp ?? 0,
    is_me: e.is_me ?? false,
    full_name: e.full_name ?? '',
    avatar_url: e.avatar_url ?? '',
  };
}

function normalizeMyLeaderboard(
  data: GetMyLeaderboardResponse,
): GetMyLeaderboardResponse {
  return {
    ...data,
    my_rank: data.my_rank ?? 0,
    my_weekly_xp: data.my_weekly_xp ?? 0,
    promotion_count: data.promotion_count ?? 0,
    demotion_count: data.demotion_count ?? 0,
    entries: (data.entries ?? []).map(normalizeLeaderboardEntry),
  };
}

function normalizeMyLeague(data: GetMyLeagueResponse): GetMyLeagueResponse {
  return {
    ...data,
    user_league: {
      ...data.user_league,
      weekly_xp: data.user_league?.weekly_xp ?? 0,
      rank_in_cohort: data.user_league?.rank_in_cohort ?? 0,
    },
  };
}

function normalizeFriendEntry(
  e: LeaderboardFriendEntry,
): LeaderboardFriendEntry {
  return {
    ...e,
    rank: e.rank ?? 0,
    weekly_xp: e.weekly_xp ?? 0,
    is_me: e.is_me ?? false,
    full_name: e.full_name ?? '',
    username: e.username ?? '',
    avatar_url: e.avatar_url ?? '',
  };
}

function normalizeHistory(
  data: GetLeagueHistoryResponse,
): GetLeagueHistoryResponse {
  return {
    ...data,
    total: data.total ?? 0,
    entries: (data.entries ?? []).map((e) => ({
      ...e,
      final_xp: e.final_xp ?? 0,
      final_rank: e.final_rank ?? 0,
      gems_earned: e.gems_earned ?? 0,
      promoted: e.promoted ?? false,
      demoted: e.demoted ?? false,
    })),
  };
}

/**
 * Phase 4: social-service через gateway.
 *
 * Gateway маршруты (см. AGENTS.md backend):
 *   GET  /api/v1/leagues                       — public каталог 10 лиг
 *   GET  /api/v1/leagues/mine                  — моя лига (auth)
 *   GET  /api/v1/leagues/mine/leaderboard      — топ 30 когорты (auth)
 *   GET  /api/v1/leagues/history?limit=&offset= — история (auth)
 */
export const SocialApi = {
  listLeagues: () => ApiClient.get<ListLeaguesResponse>('/leagues'),

  getMyLeague: () =>
    ApiClient.get<GetMyLeagueResponse>('/leagues/mine').then(normalizeMyLeague),

  getMyLeaderboard: () =>
    ApiClient.get<GetMyLeaderboardResponse>('/leagues/mine/leaderboard').then(
      normalizeMyLeaderboard,
    ),

  getHistory: (opts: { limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.limit) qs.set('limit', String(opts.limit));
    if (opts.offset) qs.set('offset', String(opts.offset));
    const q = qs.toString();
    return ApiClient.get<GetLeagueHistoryResponse>(
      `/leagues/history${q ? `?${q}` : ''}`,
    ).then(normalizeHistory);
  },
};

/**
 * Phase 4.5: Friends API через gateway.
 *
 *   GET    /api/v1/friends?limit=&offset=
 *   GET    /api/v1/friends/pending?direction=&limit=&offset=
 *   POST   /api/v1/friends/request           { user_id }
 *   POST   /api/v1/friends/accept/:friendshipId
 *   POST   /api/v1/friends/reject/:friendshipId
 *   DELETE /api/v1/friends/:friendId
 *   GET    /api/v1/friends/search?q=&limit=
 *   GET    /api/v1/friends/leaderboard?limit=
 */
export const FriendsApi = {
  list: (opts: { limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.limit) qs.set('limit', String(opts.limit));
    if (opts.offset) qs.set('offset', String(opts.offset));
    const q = qs.toString();
    return ApiClient.get<ListFriendsResponse>(`/friends${q ? `?${q}` : ''}`);
  },

  listPending: (
    opts: { direction?: PendingDirection; limit?: number; offset?: number } = {},
  ) => {
    const qs = new URLSearchParams();
    if (opts.direction && opts.direction !== 'all') {
      qs.set('direction', opts.direction);
    }
    if (opts.limit) qs.set('limit', String(opts.limit));
    if (opts.offset) qs.set('offset', String(opts.offset));
    const q = qs.toString();
    return ApiClient.get<ListPendingRequestsResponse>(
      `/friends/pending${q ? `?${q}` : ''}`,
    );
  },

  sendRequest: (userId: string) =>
    ApiClient.post<SendFriendRequestResponse>('/friends/request', {
      user_id: userId,
    }),

  accept: (friendshipId: string) =>
    ApiClient.post<AcceptFriendRequestResponse>(
      `/friends/accept/${encodeURIComponent(friendshipId)}`,
    ),

  reject: (friendshipId: string) =>
    ApiClient.post<{ ok: boolean }>(
      `/friends/reject/${encodeURIComponent(friendshipId)}`,
    ),

  remove: (friendId: string) =>
    ApiClient.delete<{ ok: boolean }>(
      `/friends/${encodeURIComponent(friendId)}`,
    ),

  search: (query: string, limit = 20) => {
    const qs = new URLSearchParams({ q: query, limit: String(limit) });
    return ApiClient.get<SearchFriendsResponse>(`/friends/search?${qs}`);
  },

  leaderboard: (limit = 50) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    return ApiClient.get<GetFriendsLeaderboardResponse>(
      `/friends/leaderboard?${qs}`,
    ).then((data) => ({
      ...data,
      entries: (data.entries ?? []).map(normalizeFriendEntry),
    }));
  },
};

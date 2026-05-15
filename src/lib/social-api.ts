import { ApiClient } from './api-client';
import type {
  GetLeagueHistoryResponse,
  GetMyLeaderboardResponse,
  GetMyLeagueResponse,
  ListLeaguesResponse,
} from '@/types/api';

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

  getMyLeague: () => ApiClient.get<GetMyLeagueResponse>('/leagues/mine'),

  getMyLeaderboard: () =>
    ApiClient.get<GetMyLeaderboardResponse>('/leagues/mine/leaderboard'),

  getHistory: (opts: { limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.limit) qs.set('limit', String(opts.limit));
    if (opts.offset) qs.set('offset', String(opts.offset));
    const q = qs.toString();
    return ApiClient.get<GetLeagueHistoryResponse>(
      `/leagues/history${q ? `?${q}` : ''}`,
    );
  },
};

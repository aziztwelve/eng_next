import { ApiClient } from './api-client';
import type {
  GeneratePracticeRequest,
  GeneratePracticeResponse,
  ListMistakesResponse,
  MistakeFilter,
  SRSDueResponse,
  SRSItemTypeShort,
  SRSReviewRequest,
  SRSReviewResponse,
  SRSStats,
  SRSWeakResponse,
  SkillStrengthsResponse,
  SkillTypeShort,
  WeakSkillsResponse,
} from '@/types/api';

/**
 * Phase 3: srs-service через gateway.
 *
 * Gateway маршруты (см. AGENTS.md backend):
 *   # SRS
 *   GET  /api/v1/srs/stats
 *   GET  /api/v1/srs/due?item_type=&limit=
 *   GET  /api/v1/srs/weak?item_type=&limit=
 *   POST /api/v1/srs/review
 *   # Practice
 *   POST /api/v1/practice/session
 *   # Mistakes
 *   GET  /api/v1/mistakes?resolved=&limit=&offset=
 *   # Skill decay
 *   GET  /api/v1/skills?skill_type=&limit=&offset=
 *   GET  /api/v1/skills/weak?skill_type=&limit=
 */

function mistakeFilterToParam(f: MistakeFilter): string | null {
  if (f === 'unresolved') return 'false';
  if (f === 'resolved') return 'true';
  return null;
}

export const SrsApi = {
  // === SRS ===
  getStats: () => ApiClient.get<SRSStats>('/srs/stats'),

  getDue: (opts: { item_type?: SRSItemTypeShort; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.item_type) qs.set('item_type', opts.item_type);
    if (opts.limit) qs.set('limit', String(opts.limit));
    const q = qs.toString();
    return ApiClient.get<SRSDueResponse>(`/srs/due${q ? `?${q}` : ''}`);
  },

  getWeak: (opts: { item_type?: SRSItemTypeShort; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.item_type) qs.set('item_type', opts.item_type);
    if (opts.limit) qs.set('limit', String(opts.limit));
    const q = qs.toString();
    return ApiClient.get<SRSWeakResponse>(`/srs/weak${q ? `?${q}` : ''}`);
  },

  review: (body: SRSReviewRequest) =>
    ApiClient.post<SRSReviewResponse>('/srs/review', body),

  // === Practice ===
  generatePracticeSession: (body: GeneratePracticeRequest = {}) =>
    ApiClient.post<GeneratePracticeResponse>('/practice/session', body),

  // === Mistakes ===
  listMistakes: (
    opts: { resolved?: MistakeFilter; limit?: number; offset?: number } = {},
  ) => {
    const qs = new URLSearchParams();
    const r = mistakeFilterToParam(opts.resolved ?? 'all');
    if (r) qs.set('resolved', r);
    if (opts.limit) qs.set('limit', String(opts.limit));
    if (opts.offset) qs.set('offset', String(opts.offset));
    const q = qs.toString();
    return ApiClient.get<ListMistakesResponse>(`/mistakes${q ? `?${q}` : ''}`);
  },

  // === Skill decay ===
  listSkills: (
    opts: { skill_type?: SkillTypeShort; limit?: number; offset?: number } = {},
  ) => {
    const qs = new URLSearchParams();
    if (opts.skill_type) qs.set('skill_type', opts.skill_type);
    if (opts.limit) qs.set('limit', String(opts.limit));
    if (opts.offset) qs.set('offset', String(opts.offset));
    const q = qs.toString();
    return ApiClient.get<SkillStrengthsResponse>(`/skills${q ? `?${q}` : ''}`);
  },

  getWeakSkills: (opts: { skill_type?: SkillTypeShort; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.skill_type) qs.set('skill_type', opts.skill_type);
    if (opts.limit) qs.set('limit', String(opts.limit));
    const q = qs.toString();
    return ApiClient.get<WeakSkillsResponse>(`/skills/weak${q ? `?${q}` : ''}`);
  },
};

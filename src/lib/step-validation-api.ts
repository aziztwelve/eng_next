import { ApiClient } from './api-client';
import type {
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  StepAttempt,
  VocabularyEntry,
  VocabularyListResponse,
  TTSCacheEntry,
} from '@/types/api';

/**
 * Phase 2: step-validation-service + vocabulary + tts.
 *
 * Gateway маршруты:
 *   POST  /api/v1/steps/:stepId/submit
 *   GET   /api/v1/steps/:stepId/attempts
 *   GET   /api/v1/vocabulary
 *   GET   /api/v1/vocabulary/:id
 *   GET   /api/v1/tts/by-text
 */
export const StepValidationApi = {
  submit: (stepId: string, body: SubmitAnswerRequest) =>
    ApiClient.post<SubmitAnswerResponse>(
      `/steps/${encodeURIComponent(stepId)}/submit`,
      body,
    ),

  listAttempts: (stepId: string, opts: { limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.limit) qs.set('limit', String(opts.limit));
    if (opts.offset) qs.set('offset', String(opts.offset));
    const q = qs.toString();
    return ApiClient.get<{ attempts: StepAttempt[]; total: number }>(
      `/steps/${encodeURIComponent(stepId)}/attempts${q ? `?${q}` : ''}`,
    );
  },
};

export const VocabularyApi = {
  list: (filter: {
    language?: string;
    target_language?: string;
    level?: string;
    pos?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    const q = qs.toString();
    return ApiClient.get<VocabularyListResponse>(`/vocabulary${q ? `?${q}` : ''}`);
  },
  get: (id: string) =>
    ApiClient.get<{ entry: VocabularyEntry }>(`/vocabulary/${encodeURIComponent(id)}`),
};

export const AdminVocabularyApi = {
  create: (entry: Omit<VocabularyEntry, 'id' | 'created_at' | 'updated_at'>) =>
    ApiClient.post<{ entry: VocabularyEntry }>('/admin/vocabulary', entry),
  update: (id: string, patch: Partial<VocabularyEntry>) =>
    ApiClient.put<{ entry: VocabularyEntry }>(
      `/admin/vocabulary/${encodeURIComponent(id)}`,
      patch,
    ),
  delete: (id: string) =>
    ApiClient.delete<{ success: boolean }>(
      `/admin/vocabulary/${encodeURIComponent(id)}`,
    ),
  bulkCreate: (entries: Array<Omit<VocabularyEntry, 'id' | 'created_at' | 'updated_at'>>) =>
    ApiClient.post<{ ids: string[]; created: number; skipped: number }>(
      '/admin/vocabulary/bulk',
      { entries },
    ),
};

export const TTSApi = {
  getByText: (text: string, language: string, voice?: string) => {
    const qs = new URLSearchParams({ text, language });
    if (voice) qs.set('voice', voice);
    return ApiClient.get<{ entry: TTSCacheEntry }>(`/tts/by-text?${qs.toString()}`);
  },
};

export const AdminTTSApi = {
  synthesize: (body: {
    text: string;
    language: string;
    voice?: string;
    audio_url: string;
    duration_ms?: number;
  }) =>
    ApiClient.post<{ entry: TTSCacheEntry; created: boolean }>(
      '/admin/tts/synthesize',
      body,
    ),
};

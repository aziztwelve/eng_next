import { ApiClient } from './api-client';
import { AuthService } from './auth-service';
import type {
  AIMessageFeedback,
  AIQuotaStatus,
  AskTutorRequest,
  AskTutorResponse,
  AssessWritingRequest,
  AssessWritingResponse,
  CheckPronunciationResponse,
  ExplainMistakeRequest,
  ExplainMistakeResponse,
  GetConversationResponse,
  ListConversationsResponse,
  ListScenariosResponse,
  SendMessageRequest,
  SendMessageResponse,
  StartConversationRequest,
  StartConversationResponse,
} from '@/types/api';

/**
 * Phase 5: ai-service через gateway. См. секцию "Phase 5: AI Integration"
 * в `src/types/api.ts` для списка REST-эндпоинтов.
 *
 * Все эндпоинты требуют auth (токен подставляет ApiClient.request).
 * Pronunciation идёт мимо ApiClient — multipart/form-data.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export const AIApi = {
  // === Conversations ===
  startConversation: (req: StartConversationRequest) =>
    ApiClient.post<StartConversationResponse>('/ai/conversations', req),

  listConversations: (opts: { limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.limit) qs.set('limit', String(opts.limit));
    if (opts.offset) qs.set('offset', String(opts.offset));
    const q = qs.toString();
    return ApiClient.get<ListConversationsResponse>(
      `/ai/conversations${q ? `?${q}` : ''}`,
    );
  },

  getConversation: (id: string) =>
    ApiClient.get<GetConversationResponse>(`/ai/conversations/${id}`),

  deleteConversation: (id: string) =>
    ApiClient.delete<void>(`/ai/conversations/${id}`),

  sendMessage: (id: string, req: SendMessageRequest) =>
    ApiClient.post<SendMessageResponse>(
      `/ai/conversations/${id}/messages`,
      req,
    ),

  /**
   * sendMessageStream — Phase 5.27. POST /ai/conversations/:id/stream.
   *
   * Возвращает async generator SSE-событий, каждое — `{ type, data }`.
   * Возможные `type`: 'user' | 'delta' | 'done' | 'error'.
   *
   * Поток гарантированно завершается одним из 'done' или 'error'.
   * Прервать стрим — просто `break` из for-await цикла (под капотом
   * AbortController закроет соединение, gateway пропагирует cancel в gRPC,
   * ai-service остановит provider-вызов и не инкрементит quota).
   *
   * Пример:
   * ```ts
   * for await (const ev of AIApi.sendMessageStream(id, { content: 'Hi' })) {
   *   if (ev.type === 'delta') appendText(ev.data.delta);
   *   else if (ev.type === 'done') setFinal(ev.data);
   *   else if (ev.type === 'error') showError(ev.data.error);
   * }
   * ```
   */
  async *sendMessageStream(
    id: string,
    req: SendMessageRequest,
    opts: { signal?: AbortSignal } = {},
  ): AsyncGenerator<AIStreamEvent, void, void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    };
    const token = await AuthService.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/ai/conversations/${id}/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
      signal: opts.signal,
    });

    if (!res.ok || !res.body) {
      const text = await safeText(res);
      throw { message: text || `HTTP ${res.status}`, statusCode: res.status };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) return;
        buffer += decoder.decode(value, { stream: true });

        // SSE-события разделены пустой строкой "\n\n".
        let sepIdx: number;
        while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, sepIdx);
          buffer = buffer.slice(sepIdx + 2);
          const ev = parseSSEBlock(raw);
          if (ev) yield ev;
          if (ev && (ev.type === 'done' || ev.type === 'error')) return;
        }
      }
    } finally {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
    }
  },

  listScenarios: (opts: { language?: string; user_level?: string } = {}) => {
    const qs = new URLSearchParams();
    if (opts.language) qs.set('language', opts.language);
    if (opts.user_level) qs.set('user_level', opts.user_level);
    const q = qs.toString();
    return ApiClient.get<ListScenariosResponse>(
      `/ai/scenarios${q ? `?${q}` : ''}`,
    );
  },

  // === Single-shot ===
  explainMistake: (req: ExplainMistakeRequest) =>
    ApiClient.post<ExplainMistakeResponse>('/ai/explain', req),

  assessWriting: (req: AssessWritingRequest) =>
    ApiClient.post<AssessWritingResponse>('/ai/writing/assess', req),

  askTutor: (req: AskTutorRequest) =>
    ApiClient.post<AskTutorResponse>('/ai/tutor', req),

  /**
   * askTutorStream — Phase 5.X. POST /ai/tutor/stream.
   *
   * Async generator SSE-событий для streaming Q&A. Контракт идентичен
   * sendMessageStream, минус 'user' event (нет persistence).
   *
   * Возможные `type`: 'delta' | 'done' | 'error'. Поток гарантированно
   * завершается одним из 'done' | 'error'. Прервать = `break` или signal.
   */
  async *askTutorStream(
    req: AskTutorRequest,
    opts: { signal?: AbortSignal } = {},
  ): AsyncGenerator<AITutorStreamEvent, void, void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    };
    const token = await AuthService.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/ai/tutor/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
      signal: opts.signal,
    });

    if (!res.ok || !res.body) {
      const text = await safeText(res);
      throw { message: text || `HTTP ${res.status}`, statusCode: res.status };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) return;
        buffer += decoder.decode(value, { stream: true });

        let sepIdx: number;
        while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, sepIdx);
          buffer = buffer.slice(sepIdx + 2);
          const ev = parseTutorSSEBlock(raw);
          if (ev) yield ev;
          if (ev && (ev.type === 'done' || ev.type === 'error')) return;
        }
      }
    } finally {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
    }
  },

  // === Pronunciation (multipart) ===
  /**
   * Pronunciation идёт через `multipart/form-data` — нужен File / Blob.
   * ApiClient заточен под JSON, поэтому здесь fetch напрямую с подстановкой
   * Authorization-заголовка через AuthService.
   */
  async checkPronunciation(input: {
    audio: Blob;
    audioFilename?: string;
    target_text: string;
    language?: string;
    step_id?: string;
  }): Promise<CheckPronunciationResponse> {
    const fd = new FormData();
    fd.append(
      'audio',
      input.audio,
      input.audioFilename ?? blobFilename(input.audio),
    );
    fd.append('target_text', input.target_text);
    if (input.language) fd.append('language', input.language);
    if (input.step_id) fd.append('step_id', input.step_id);

    const headers: Record<string, string> = {};
    const token = await AuthService.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/ai/pronunciation/check`, {
      method: 'POST',
      headers,
      body: fd,
    });

    if (!res.ok) {
      const text = await safeText(res);
      throw {
        message: text || `HTTP ${res.status}`,
        statusCode: res.status,
      };
    }
    return (await res.json()) as CheckPronunciationResponse;
  },

  // === Quota ===
  getQuota: () => ApiClient.get<AIQuotaStatus>('/ai/quota'),

  // === Feedback (Phase 5.X) — thumbs up/down на assistant-message ===
  submitFeedback: (
    messageId: string,
    rating: 1 | -1,
    comment?: string,
  ) =>
    ApiClient.post<{ feedback: AIMessageFeedback }>(
      `/ai/messages/${messageId}/feedback`,
      { rating, comment },
    ),

  deleteFeedback: (messageId: string) =>
    ApiClient.delete<void>(`/ai/messages/${messageId}/feedback`),
};

function blobFilename(blob: Blob): string {
  const ext = (blob.type.split('/')[1] ?? 'webm').split(';')[0];
  return `recording.${ext}`;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

// =====================================================================
// SSE streaming (Phase 5.27)
// =====================================================================

/**
 * AIStreamEvent — типизированное SSE-событие от ai gateway.
 *
 * Schema (см. handler/ai.go SendMessageStream):
 *   - 'user'   — { user_message: Message }     первый event
 *   - 'delta'  — { delta: string }             0..N инкрементальных кусочков
 *   - 'done'   — SendMessageResponse           terminal success
 *   - 'error'  — { error: string }             terminal failure
 */
export type AIStreamEvent =
  | { type: 'user'; data: { user_message: import('@/types/api').AIMessage } }
  | { type: 'delta'; data: { delta: string } }
  | { type: 'done'; data: SendMessageResponse }
  | { type: 'error'; data: { error: string } };

/**
 * parseSSEBlock — парсит один SSE-блок (формат RFC 8895).
 *
 * Поддерживает только два поля: `event:` и `data:` (без id, retry).
 * Несколько `data:` строк склеиваются через '\n' (как в спеке).
 * Возвращает null если блок пустой или JSON невалидный.
 */
function parseSSEBlock(block: string): AIStreamEvent | null {
  if (!block.trim()) return null;

  let eventName = 'message';
  const dataLines: string[] = [];
  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) continue; // comment / blank
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const field = line.slice(0, colonIdx);
    // RFC: один пробел после ":" должен срезаться
    let value = line.slice(colonIdx + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'event') eventName = value;
    else if (field === 'data') dataLines.push(value);
  }
  if (dataLines.length === 0) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(dataLines.join('\n'));
  } catch {
    return null;
  }

  switch (eventName) {
    case 'user':
      return { type: 'user', data: parsed as { user_message: import('@/types/api').AIMessage } };
    case 'delta':
      return { type: 'delta', data: parsed as { delta: string } };
    case 'done':
      return { type: 'done', data: parsed as SendMessageResponse };
    case 'error':
      return { type: 'error', data: parsed as { error: string } };
    default:
      return null;
  }
}

/**
 * AITutorStreamEvent — типизированное SSE-событие от ai gateway для AskTutorStream.
 *
 * Schema (handler/ai.go AskTutorStream):
 *   - 'delta'  — { delta: string }      0..N инкрементальных кусочков
 *   - 'done'   — AskTutorResponse       terminal success
 *   - 'error'  — { error: string }      terminal failure
 */
export type AITutorStreamEvent =
  | { type: 'delta'; data: { delta: string } }
  | { type: 'done'; data: AskTutorResponse }
  | { type: 'error'; data: { error: string } };

function parseTutorSSEBlock(block: string): AITutorStreamEvent | null {
  if (!block.trim()) return null;

  let eventName = 'message';
  const dataLines: string[] = [];
  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const field = line.slice(0, colonIdx);
    let value = line.slice(colonIdx + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'event') eventName = value;
    else if (field === 'data') dataLines.push(value);
  }
  if (dataLines.length === 0) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(dataLines.join('\n'));
  } catch {
    return null;
  }

  switch (eventName) {
    case 'delta':
      return { type: 'delta', data: parsed as { delta: string } };
    case 'done':
      return { type: 'done', data: parsed as AskTutorResponse };
    case 'error':
      return { type: 'error', data: parsed as { error: string } };
    default:
      return null;
  }
}

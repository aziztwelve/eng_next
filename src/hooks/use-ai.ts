'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useIsAuthenticated } from '@/hooks/use-auth';
import { AIApi } from '@/lib/ai-api';
import type {
  AskTutorRequest,
  AssessWritingRequest,
  AIMessage,
  ExplainMistakeRequest,
  SendMessageRequest,
  SendMessageResponse,
  StartConversationRequest,
} from '@/types/api';

// === Query keys ===
export const AI_QUOTA_KEY = ['ai', 'quota'] as const;
export const AI_CONVERSATIONS_KEY = ['ai', 'conversations'] as const;
export const AI_SCENARIOS_KEY = ['ai', 'scenarios'] as const;

/** Quota status — обновляется после chat/writing/voice вызовов. */
export function useAIQuota() {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: AI_QUOTA_KEY,
    queryFn: () => AIApi.getQuota(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

/** Список конверсаций пользователя. */
export function useAIConversations(opts: { limit?: number; offset?: number } = {}) {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: [...AI_CONVERSATIONS_KEY, opts.limit ?? 20, opts.offset ?? 0],
    queryFn: () => AIApi.listConversations(opts),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

/** Конверсация + все сообщения. */
export function useAIConversation(id: string | undefined) {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: [...AI_CONVERSATIONS_KEY, id],
    queryFn: () => AIApi.getConversation(id!),
    enabled: isAuthenticated && !!id,
    staleTime: 0, // всегда свежие сообщения после возврата на страницу
  });
}

/** Каталог roleplay-сценариев (статика бэкенда). Долгий кэш. */
export function useAIScenarios(opts: { language?: string; user_level?: string } = {}) {
  return useQuery({
    queryKey: [...AI_SCENARIOS_KEY, opts.language ?? '', opts.user_level ?? ''],
    queryFn: () => AIApi.listScenarios(opts),
    staleTime: 5 * 60 * 1000,
  });
}

/** Старт новой конверсации. После успеха инвалидируем list + quota. */
export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: StartConversationRequest) => AIApi.startConversation(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AI_CONVERSATIONS_KEY });
      qc.invalidateQueries({ queryKey: AI_QUOTA_KEY });
    },
  });
}

/** Отправить user-сообщение. После успеха инвалидируем конкретный conversation + quota. */
export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: SendMessageRequest) =>
      AIApi.sendMessage(conversationId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...AI_CONVERSATIONS_KEY, conversationId] });
      qc.invalidateQueries({ queryKey: AI_CONVERSATIONS_KEY });
      qc.invalidateQueries({ queryKey: AI_QUOTA_KEY });
    },
  });
}

/**
 * useSendMessageStream — Phase 5.27. SSE-стриминг chat-ответов с
 * typewriter-эффектом.
 *
 * Контракт хука:
 *   - `userMessage` — заполняется ровно один раз, на первом event'е
 *     (после sanitize+persist на бэке);
 *   - `streamingText` — растущий буфер delta-чанков (по сути промежуточный
 *     content для последнего assistant-bubble);
 *   - `assistantMessage` — финальный полный Message при success;
 *   - `error` — string при mid-stream ошибке либо setup-ошибке;
 *   - `isStreaming` — true пока стрим открыт.
 *
 * Поведение:
 *   - `send(req)` запускает поток. Можно вызывать заново — предыдущий
 *     прерывается AbortController'ом.
 *   - `abort()` ручная отмена.
 *   - После terminal-event (done или error) хук инвалидирует
 *     conversation + quota query'ки.
 *
 * Пример:
 * ```tsx
 * const { send, isStreaming, streamingText, assistantMessage, error } = useSendMessageStream(id);
 * <button onClick={() => send({ content })}>Send</button>
 * {isStreaming && <Bubble>{streamingText}</Bubble>}
 * ```
 */
export function useSendMessageStream(conversationId: string) {
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [userMessage, setUserMessage] = useState<AIMessage | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [assistantMessage, setAssistantMessage] = useState<AIMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUserMessage(null);
    setStreamingText('');
    setAssistantMessage(null);
    setError(null);
  }, []);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const send = useCallback(
    async (req: SendMessageRequest) => {
      // Прерываем предыдущий стрим, если был.
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      reset();
      setIsStreaming(true);

      try {
        for await (const ev of AIApi.sendMessageStream(conversationId, req, {
          signal: ctrl.signal,
        })) {
          if (ctrl.signal.aborted) break;
          switch (ev.type) {
            case 'user':
              setUserMessage(ev.data.user_message);
              break;
            case 'delta':
              setStreamingText((prev) => prev + ev.data.delta);
              break;
            case 'done': {
              const done = ev.data as SendMessageResponse;
              setAssistantMessage(done.assistant_message);
              break;
            }
            case 'error':
              setError(ev.data.error || 'stream error');
              break;
          }
        }
      } catch (e) {
        if (!ctrl.signal.aborted) {
          const msg = e instanceof Error ? e.message : 'stream failed';
          setError(msg);
        }
      } finally {
        setIsStreaming(false);
        if (abortRef.current === ctrl) abortRef.current = null;
        qc.invalidateQueries({ queryKey: [...AI_CONVERSATIONS_KEY, conversationId] });
        qc.invalidateQueries({ queryKey: AI_CONVERSATIONS_KEY });
        qc.invalidateQueries({ queryKey: AI_QUOTA_KEY });
      }
    },
    [conversationId, qc, reset],
  );

  return {
    send,
    abort,
    reset,
    isStreaming,
    userMessage,
    streamingText,
    assistantMessage,
    error,
  };
}

/** Удалить конверсацию (soft-delete на бэке). */
export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AIApi.deleteConversation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AI_CONVERSATIONS_KEY });
    },
  });
}

/** Объяснение ошибки (с кэшированием на бэке по step_id+md5(answer)). */
export function useExplainMistake() {
  return useMutation({
    mutationFn: (req: ExplainMistakeRequest) => AIApi.explainMistake(req),
  });
}

/** Writing assessment. */
export function useAssessWriting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AssessWritingRequest) => AIApi.assessWriting(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AI_QUOTA_KEY });
    },
  });
}

/** Tutor — однократный Q&A. */
export function useAskTutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AskTutorRequest) => AIApi.askTutor(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AI_QUOTA_KEY });
    },
  });
}

/**
 * useAskTutorStream — Phase 5.X. SSE-стриминг tutor Q&A с typewriter
 * эффектом. Контракт идентичен `useSendMessageStream`, минус
 * `userMessage` (нет persistence).
 *
 * Контракт хука:
 *   - `streamingText` — растущий буфер delta-чанков;
 *   - `answer` — финальный полный ответ (≡ done.answer) при success;
 *   - `tokensUsed` / `costUSD` — метаданные провайдера, заполняются на done;
 *   - `error` — string при mid-stream / setup-ошибке;
 *   - `isStreaming` — true пока стрим открыт.
 *
 * `ask(req)` запускает поток; повторный вызов прерывает предыдущий.
 * `abort()` — ручная отмена. После terminal-event инвалидируется
 * `AI_QUOTA_KEY` (счётчик chat увеличился на 1).
 */
export function useAskTutorStream() {
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [costUSD, setCostUSD] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStreamingText('');
    setAnswer(null);
    setTokensUsed(null);
    setCostUSD(null);
    setError(null);
  }, []);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const ask = useCallback(
    async (req: AskTutorRequest) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      reset();
      setIsStreaming(true);

      try {
        for await (const ev of AIApi.askTutorStream(req, {
          signal: ctrl.signal,
        })) {
          if (ctrl.signal.aborted) break;
          switch (ev.type) {
            case 'delta':
              setStreamingText((prev) => prev + ev.data.delta);
              break;
            case 'done':
              setAnswer(ev.data.answer);
              setTokensUsed(ev.data.tokens_used ?? null);
              setCostUSD(ev.data.cost_usd ?? null);
              break;
            case 'error':
              setError(ev.data.error || 'stream error');
              break;
          }
        }
      } catch (e) {
        if (!ctrl.signal.aborted) {
          const msg = e instanceof Error ? e.message : 'stream failed';
          setError(msg);
        }
      } finally {
        setIsStreaming(false);
        if (abortRef.current === ctrl) abortRef.current = null;
        qc.invalidateQueries({ queryKey: AI_QUOTA_KEY });
      }
    },
    [qc, reset],
  );

  return {
    ask,
    abort,
    reset,
    isStreaming,
    streamingText,
    answer,
    tokensUsed,
    costUSD,
    error,
  };
}

/** Pronunciation check (multipart). */
export function useCheckPronunciation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      audio: Blob;
      audioFilename?: string;
      target_text: string;
      language?: string;
      step_id?: string;
    }) => AIApi.checkPronunciation(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AI_QUOTA_KEY });
    },
  });
}

/**
 * Phase 5.X — поставить thumbs up/down на assistant-message.
 * Невалидирует кеш конкретного conversation, чтобы свежие feedback'и
 * подтянулись с бэка (fields user_feedback в messages).
 */
export function useSubmitMessageFeedback(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      messageId: string;
      rating: 1 | -1;
      comment?: string;
    }) => AIApi.submitFeedback(input.messageId, input.rating, input.comment),
    onSuccess: () => {
      if (conversationId) {
        qc.invalidateQueries({
          queryKey: [...AI_CONVERSATIONS_KEY, conversationId],
        });
      }
    },
  });
}

/** Phase 5.X — снять оценку. */
export function useDeleteMessageFeedback(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => AIApi.deleteFeedback(messageId),
    onSuccess: () => {
      if (conversationId) {
        qc.invalidateQueries({
          queryKey: [...AI_CONVERSATIONS_KEY, conversationId],
        });
      }
    },
  });
}

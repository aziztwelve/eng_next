'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatInput } from '@/components/ai/chat-input';
import { ChatMessage } from '@/components/ai/chat-message';
import { hasQuotaLeft } from '@/components/ai/quota-widget';
import {
  useAIConversation,
  useAIQuota,
  useSendMessageStream,
} from '@/hooks/use-ai';
import { useLanguage } from '@/lib/i18n';

/**
 * /ai/chat/[id] — экран одной конверсации (free_chat / roleplay_* / tutor_qa).
 *
 * Авто-скролл к низу при появлении новых сообщений (включая optimistic
 * pending state — visualизация AI «печатает»).
 */
export default function ChatConversationPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const conv = useAIConversation(id);
  const quota = useAIQuota();
  const stream = useSendMessageStream(id);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = conv.data?.messages ?? [];
  const conversation = conv.data?.conversation;
  const canChat = hasQuotaLeft(quota.data, 'chat');

  // Auto-scroll on new messages or streaming text growing.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length, stream.isStreaming, stream.streamingText.length]);

  const handleSend = async (content: string, wantAudio: boolean) => {
    // Phase 5.27: SSE streaming для typewriter UX.
    // want_audio в стриме игнорируется на бэке (streaming-режим = plain text).
    void wantAudio;
    await stream.send({ content });
  };

  // Если стрим прислал user-message, но conversation refetch ещё не пришёл,
  // показываем optimistic user-bubble в конце списка.
  const showOptimisticUser =
    stream.userMessage &&
    !messages.some((m) => m.id === stream.userMessage?.id);

  if (conv.isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </Card>
      </div>
    );
  }

  if (conv.error || !conversation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Card className="rounded-3xl border-4 p-12 text-center space-y-3">
          <p className="font-black text-lg">{t('ai.chat.notFound')}</p>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/ai/chat">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('ai.chat.backToList')}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isRoleplay = conversation.scenario.startsWith('roleplay_');
  const isTutor = conversation.scenario === 'tutor_qa';

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 mb-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-xl shrink-0"
        >
          <Link href="/ai/chat" aria-label={t('ai.chat.backAria')}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-lg truncate">
            {conversation.title || t('ai.chat.title')}
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <Badge
              className={`rounded-lg uppercase font-bold ${
                isTutor
                  ? 'bg-amber-500/15 text-amber-600'
                  : isRoleplay
                    ? 'bg-rose-500/15 text-rose-600'
                    : 'bg-primary/15 text-primary'
              }`}
            >
              {isTutor
                ? t('ai.chatList.tagTutor')
                : isRoleplay
                  ? t('ai.chatList.tagRoleplay')
                  : t('ai.chatList.tagFreeChat')}
            </Badge>
            {conversation.target_language && (
              <Badge className="rounded-lg uppercase font-bold bg-muted text-foreground">
                {conversation.target_language}
              </Badge>
            )}
            {conversation.user_level && (
              <Badge className="rounded-lg uppercase font-bold bg-muted text-foreground">
                {conversation.user_level}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1"
      >
        {messages.length === 0 && !showOptimisticUser ? (
          <Card className="rounded-3xl border-4 p-12 text-center text-muted-foreground font-medium">
            {t('ai.chat.emptyHint')}
          </Card>
        ) : (
          messages.map((m) => (
            <ChatMessage key={m.id} message={m} conversationId={id} />
          ))
        )}

        {/* Optimistic user bubble — пока conversation refetch не пришёл. */}
        {showOptimisticUser && stream.userMessage && (
          <ChatMessage
            key={stream.userMessage.id}
            message={stream.userMessage}
            conversationId={id}
          />
        )}

        {/* Streaming assistant bubble — typewriter эффект. */}
        {stream.isStreaming && (
          <div className="flex gap-3">
            <div className="shrink-0 w-9 h-9 rounded-2xl bg-card border-2 border-border flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
            <div className="rounded-2xl px-4 py-2.5 border-2 bg-card border-border text-foreground text-sm font-medium whitespace-pre-wrap">
              {stream.streamingText || (
                <span className="text-muted-foreground">
                  {t('ai.chat.aiTyping')}
                </span>
              )}
              <span className="inline-block w-2 h-4 ml-0.5 bg-primary align-middle animate-pulse" />
            </div>
          </div>
        )}

        {stream.error && (
          <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive">
            {t('ai.chat.sendError')}: {stream.error}
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">
        {!canChat && (
          <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-500 mb-2">
            {t('ai.chat.quotaExhausted')}
          </div>
        )}
        <ChatInput
          onSend={handleSend}
          loading={stream.isStreaming}
          placeholder={
            isRoleplay
              ? t('ai.chat.placeholderRoleplay')
              : t('ai.chat.placeholderDefault')
          }
        />
      </div>
    </div>
  );
}

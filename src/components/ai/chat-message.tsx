'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Bot,
  ChevronDown,
  Languages,
  ThumbsDown,
  ThumbsUp,
  User as UserIcon,
  Volume2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useDeleteMessageFeedback,
  useSubmitMessageFeedback,
} from '@/hooks/use-ai';
import { useLanguage } from '@/lib/i18n';
import type { AIMessage } from '@/types/api';

/**
 * ChatMessage — bubble одного сообщения чата.
 *  - user-сообщения справа (primary background).
 *  - assistant-сообщения слева (card background) + corrections (для
 *    предыдущего user-сообщения) + translation (раскрывается).
 *  - audio_url проигрывается через `<audio>`.
 */
export function ChatMessage({
  message,
  conversationId,
}: {
  message: AIMessage;
  /** Нужен для invalidate query после feedback. Если опущен —
      thumbs-кнопки не показываются (например в pending-state). */
  conversationId?: string;
}) {
  const isUser = message.role === 'MESSAGE_ROLE_USER';
  const isSystem = message.role === 'MESSAGE_ROLE_SYSTEM';

  if (isSystem) {
    // Системные сообщения скрываем — это служебный prompt-контекст.
    return null;
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center font-black ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border-2 border-border text-foreground'
        }`}
      >
        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 border-2 ${
            isUser
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border'
          }`}
        >
          <div
            className={`prose prose-sm max-w-none ${
              isUser ? 'prose-invert' : 'dark:prose-invert'
            } prose-p:my-0 prose-a:underline`}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

        {/* Audio player (для assistant TTS reply) */}
        {message.audio_url && !isUser && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Volume2 className="h-3.5 w-3.5" />
            <audio controls src={message.audio_url} className="h-8" />
          </div>
        )}

        {/* Corrections (assistant фидбэк по user-сообщению) */}
        {!isUser && message.corrections && message.corrections.length > 0 && (
          <CorrectionsList corrections={message.corrections} />
        )}

        {/* Translation toggle (assistant) */}
        {!isUser && message.translation && (
          <TranslationToggle translation={message.translation} />
        )}

        {/* Feedback (thumbs up/down) — только для persisted assistant-message */}
        {!isUser && conversationId && message.id && (
          <FeedbackButtons
            messageId={message.id}
            conversationId={conversationId}
            currentRating={message.user_feedback?.rating}
          />
        )}
      </div>
    </div>
  );
}

/** FeedbackButtons — Phase 5.X. Сохраняет thumbs up/down. */
function FeedbackButtons({
  messageId,
  conversationId,
  currentRating,
}: {
  messageId: string;
  conversationId: string;
  currentRating?: 1 | -1;
}) {
  const { t } = useLanguage();
  const submit = useSubmitMessageFeedback(conversationId);
  const remove = useDeleteMessageFeedback(conversationId);
  const pending = submit.isPending || remove.isPending;

  const handle = (rating: 1 | -1) => {
    if (currentRating === rating) {
      // Повторный клик по уже выставленной оценке — снимаем.
      remove.mutate(messageId);
    } else {
      submit.mutate({ messageId, rating });
    }
  };

  const upActive = currentRating === 1;
  const downActive = currentRating === -1;

  return (
    <div className="flex items-center gap-1 mt-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => handle(1)}
        aria-label={upActive ? t('ai.chatMessage.unlikeAria') : t('ai.chatMessage.likeAria')}
        className={`h-7 w-7 p-0 ${
          upActive
            ? 'text-emerald-600 bg-emerald-500/15 hover:bg-emerald-500/25'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" fill={upActive ? 'currentColor' : 'none'} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => handle(-1)}
        aria-label={downActive ? t('ai.chatMessage.undislikeAria') : t('ai.chatMessage.dislikeAria')}
        className={`h-7 w-7 p-0 ${
          downActive
            ? 'text-destructive bg-destructive/15 hover:bg-destructive/25'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <ThumbsDown
          className="h-3.5 w-3.5"
          fill={downActive ? 'currentColor' : 'none'}
        />
      </Button>
    </div>
  );
}

function CorrectionsList({
  corrections,
}: {
  corrections: NonNullable<AIMessage['corrections']>;
}) {
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 px-3 py-2 space-y-1.5 w-full">
      <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 uppercase tracking-wider">
        <AlertCircle className="h-3.5 w-3.5" />
        {t('ai.chatMessage.correctionsTitle')}
      </div>
      {corrections.map((c, i) => (
        <div key={i} className="text-sm">
          <div className="flex flex-wrap items-center gap-1">
            <Badge className="bg-destructive/15 text-destructive line-through rounded-lg font-mono">
              {c.original}
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge className="bg-emerald-500/15 text-emerald-600 rounded-lg font-mono">
              {c.corrected}
            </Badge>
          </div>
          {c.explanation && (
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {c.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function TranslationToggle({ translation }: { translation: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Languages className="h-3.5 w-3.5" />
        {open ? t('ai.chatMessage.hideTranslation') : t('ai.chatMessage.showTranslation')}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </Button>
      {open && (
        <div className="rounded-xl bg-muted/50 border border-border px-3 py-2 text-sm font-medium text-muted-foreground italic mt-1">
          {translation}
        </div>
      )}
    </div>
  );
}

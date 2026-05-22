'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Loader2,
  MessageSquarePlus,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuotaWidget, hasQuotaLeft } from '@/components/ai/quota-widget';
import {
  useAIConversations,
  useAIQuota,
  useDeleteConversation,
  useStartConversation,
} from '@/hooks/use-ai';
import { useLanguage } from '@/lib/i18n';
import type { AIConversation } from '@/types/api';

/**
 * /ai/chat — список конверсаций + кнопка "Новый чат" (free_chat scenario).
 * Roleplay-конкретные сценарии — на /ai/roleplay.
 */
export default function ChatListPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [targetLang, setTargetLang] = useState('en');
  const list = useAIConversations({ limit: 50 });
  const quota = useAIQuota();
  const startMut = useStartConversation();
  const deleteMut = useDeleteConversation();

  const conversations = list.data?.conversations ?? [];
  const canChat = hasQuotaLeft(quota.data, 'chat');

  const handleNew = async () => {
    if (!canChat) return;
    const resp = await startMut.mutateAsync({
      scenario: 'free_chat',
      target_language: targetLang,
    });
    router.push(`/ai/chat/${resp.conversation.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('ai.chatList.deleteConfirm'))) return;
    await deleteMut.mutateAsync(id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          {t('ai.chatList.title')}
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          {t('ai.chatList.subtitle')}
        </p>
      </div>

      <QuotaWidget compact />

      <Card className="rounded-3xl border-4 p-6 bg-primary/5 space-y-3">
        <h2 className="text-xl font-black flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5" />
          {t('ai.chatList.newChat')}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-bold text-muted-foreground">
            {t('ai.chatList.languageLabel')}
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
          <Button
            onClick={handleNew}
            disabled={!canChat || startMut.isPending}
            className="rounded-2xl h-11 px-5 font-black bg-primary hover:bg-primary/90 ml-auto"
          >
            {startMut.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MessageSquarePlus className="h-4 w-4 mr-2" />
            )}
            {t('ai.chatList.startBtn')}
          </Button>
        </div>
        {!canChat && (
          <p className="text-sm font-medium text-destructive">
            {t('ai.chatList.quotaExhausted')}
          </p>
        )}
      </Card>

      <div>
        <h2 className="text-xl font-black mb-3">{t('ai.chatList.historyTitle')}</h2>
        {list.isLoading ? (
          <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Card>
        ) : conversations.length === 0 ? (
          <Card className="rounded-3xl border-4 p-12 text-center space-y-2">
            <Bot className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-bold">{t('ai.chatList.emptyTitle')}</p>
            <p className="text-sm text-muted-foreground font-medium">
              {t('ai.chatList.emptyHint')}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <ConversationRow
                key={c.id}
                conv={c}
                onDelete={() => handleDelete(c.id)}
                deleting={deleteMut.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationRow({
  conv,
  onDelete,
  deleting,
}: {
  conv: AIConversation;
  onDelete: () => void;
  deleting: boolean;
}) {
  const { t, language } = useLanguage();
  const isRoleplay = conv.scenario.startsWith('roleplay_');
  const isTutor = conv.scenario === 'tutor_qa';
  const tag = isTutor
    ? t('ai.chatList.tagTutor')
    : isRoleplay
      ? t('ai.chatList.tagRoleplay')
      : t('ai.chatList.tagFreeChat');
  const tagColor = isTutor
    ? 'bg-amber-500/15 text-amber-600'
    : isRoleplay
      ? 'bg-rose-500/15 text-rose-600'
      : 'bg-primary/15 text-primary';

  const fmtDate = (s: string | undefined): string => {
    if (!s) return '';
    try {
      return new Date(s).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return s;
    }
  };

  return (
    <Card className="rounded-2xl border-2 p-4 flex items-center gap-3">
      <Link href={`/ai/chat/${conv.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-base truncate">
            {conv.title ||
              t('ai.chatList.chatFromDate').replace('{date}', fmtDate(conv.started_at))}
          </span>
          <Badge className={`rounded-lg uppercase font-bold ${tagColor}`}>
            {tag}
          </Badge>
          {conv.target_language && (
            <Badge className="rounded-lg uppercase font-bold bg-muted text-foreground">
              {conv.target_language}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground font-medium mt-1">
          {t('ai.chatList.messagesCount').replace('{count}', String(conv.message_count))}
          {conv.last_message_at &&
            t('ai.chatList.lastSep').replace('{date}', fmtDate(conv.last_message_at))}
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={deleting}
        className="rounded-xl text-destructive hover:bg-destructive/10"
        aria-label={t('ai.chatList.deleteAria')}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Card>
  );
}

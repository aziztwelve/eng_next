'use client';

import { Loader2, Sparkles, Crown } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAIQuota } from '@/hooks/use-ai';
import { useLanguage } from '@/lib/i18n';
import type { AIQuotaStatus } from '@/types/api';

/**
 * QuotaWidget — карточка с текущим потреблением AI-лимитов.
 * Используется на /ai (hub) и в углах chat / writing / pronunciation страниц
 * (через `compact` пропс).
 *
 * limit = -1 → unlimited (premium юзеры).
 */
export function QuotaWidget({ compact = false }: { compact?: boolean }) {
  const { language, t } = useLanguage();
  const { data, isLoading } = useAIQuota();

  if (isLoading) {
    return (
      <Card
        className={`rounded-3xl border-4 ${compact ? 'p-3' : 'p-6'} flex items-center justify-center`}
      >
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!data) return null;

  const isPremium = data.plan === 'premium';

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge className="rounded-xl bg-primary/15 text-primary font-bold gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          {isPremium ? t('ai.quota.plansPremium') : t('ai.quota.plansFree')}
        </Badge>
        {!isPremium && (
          <>
            <Pill label={t('ai.quota.chats')} used={data.chat_used} limit={data.chat_limit} />
            <Pill
              label={t('ai.quota.writing')}
              used={data.writing_used}
              limit={data.writing_limit}
            />
            <Pill
              label={t('ai.quota.voiceMin')}
              used={Math.round(data.voice_minutes_used * 10) / 10}
              limit={data.voice_minutes_limit}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="rounded-3xl border-4 p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t('ai.quota.today')}
        </h3>
        <Badge
          className={`rounded-xl font-bold gap-1 ${
            isPremium
              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isPremium ? <Crown className="h-3.5 w-3.5" /> : null}
          {isPremium ? t('ai.quota.plansPremium') : t('ai.quota.plansFree')}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <QuotaCounter
          label={t('ai.quota.chats')}
          used={data.chat_used}
          limit={data.chat_limit}
        />
        <QuotaCounter
          label={t('ai.quota.voiceMin')}
          used={Math.round(data.voice_minutes_used * 10) / 10}
          limit={data.voice_minutes_limit}
        />
        <QuotaCounter
          label={t('ai.quota.writing')}
          used={data.writing_used}
          limit={data.writing_limit}
        />
      </div>

      {data.resets_at && !isPremium && (
        <p className="text-xs text-muted-foreground font-medium">
          {t('ai.quota.resetsAt')}{' '}
          {new Date(data.resets_at).toLocaleString(language === 'en' ? 'en-US' : 'ru-RU')}
        </p>
      )}
    </Card>
  );
}

function QuotaCounter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const unlimited = limit < 0;
  const exceeded = !unlimited && used >= limit;
  return (
    <div>
      <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-2xl font-black tabular-nums ${
          exceeded
            ? 'text-destructive'
            : unlimited
              ? 'text-amber-500'
              : 'text-foreground'
        }`}
      >
        {used}
        {!unlimited && (
          <span className="text-base text-muted-foreground"> / {limit}</span>
        )}
        {unlimited && <span className="text-base text-muted-foreground"> ∞</span>}
      </div>
    </div>
  );
}

function Pill({ label, used, limit }: { label: string; used: number; limit: number }) {
  if (limit < 0) {
    return (
      <Badge className="rounded-xl bg-amber-500/15 text-amber-500 font-bold">
        {label}: ∞
      </Badge>
    );
  }
  const exceeded = used >= limit;
  return (
    <Badge
      className={`rounded-xl font-bold ${
        exceeded
          ? 'bg-destructive/15 text-destructive'
          : 'bg-muted text-foreground'
      }`}
    >
      {label}: {used}/{limit}
    </Badge>
  );
}

/** Маленький helper для проверки "есть ли свободные слоты" в любой single-shot странице. */
export function hasQuotaLeft(q: AIQuotaStatus | undefined, kind: 'chat' | 'voice' | 'writing'): boolean {
  if (!q) return true;
  if (q.plan === 'premium') return true;
  if (kind === 'chat') return q.chat_limit < 0 || q.chat_used < q.chat_limit;
  if (kind === 'voice')
    return q.voice_minutes_limit < 0 || q.voice_minutes_used < q.voice_minutes_limit;
  return q.writing_limit < 0 || q.writing_used < q.writing_limit;
}

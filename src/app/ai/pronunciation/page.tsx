'use client';

import { useState } from 'react';
import { CheckCircle2, Mic, RotateCcw, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VoiceRecorder } from '@/components/ai/voice-recorder';
import { QuotaWidget, hasQuotaLeft } from '@/components/ai/quota-widget';
import { useAIQuota, useCheckPronunciation } from '@/hooks/use-ai';
import { useLanguage } from '@/lib/i18n';
import type { AIWordScore } from '@/types/api';

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'it', label: 'Italiano' },
];

/**
 * /ai/pronunciation — записываем аудио, отправляем + target_text +
 * language → бэк возвращает word-level scores.
 */
export default function PronunciationPage() {
  const { t } = useLanguage();
  const [target, setTarget] = useState('');
  const [language, setLanguage] = useState('en');
  const [resetSignal, setResetSignal] = useState(0);

  const quota = useAIQuota();
  const mut = useCheckPronunciation();
  const canVoice = hasQuotaLeft(quota.data, 'voice');

  const handleSubmit = async (audio: Blob) => {
    if (!target.trim() || !canVoice) return;
    try {
      await mut.mutateAsync({
        audio,
        target_text: target.trim(),
        language,
      });
    } catch (e) {
      console.error('pronunciation failed', e);
    }
  };

  const handleReset = () => {
    mut.reset();
    setResetSignal((n) => n + 1);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <Mic className="h-8 w-8 text-emerald-500" />
          {t('ai.pronunciation.title')}
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          {t('ai.pronunciation.subtitle')}
        </p>
      </div>

      <QuotaWidget compact />

      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <Field label={t('ai.pronunciation.phraseLabel')}>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={t('ai.pronunciation.phrasePlaceholder')}
              className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium w-full"
            />
          </Field>
          <Field label={t('ai.pronunciation.languageLabel')}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium w-full"
            >
              {LANG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {!canVoice && (
          <div className="text-sm font-medium text-destructive">
            {t('ai.pronunciation.quotaExhausted')}
          </div>
        )}
      </Card>

      {target.trim() ? (
        <VoiceRecorder
          key={resetSignal}
          loading={mut.isPending}
          onSubmit={handleSubmit}
        />
      ) : (
        <Card className="rounded-3xl border-4 p-12 text-center text-muted-foreground font-medium">
          {t('ai.pronunciation.enterPhraseHint')}
        </Card>
      )}

      {mut.isError && (
        <Card className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">
          {t('ai.pronunciation.error')}
        </Card>
      )}

      {mut.data && (
        <PronunciationResult
          targetText={target}
          data={mut.data}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

function PronunciationResult({
  targetText,
  data,
  onReset,
}: {
  targetText: string;
  data: ReturnType<typeof useCheckPronunciation>['data'] & object;
  onReset: () => void;
}) {
  const { t } = useLanguage();
  const overall = Math.round(data.accuracy_score * 100);
  const isGood = overall >= 75;

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              {t('ai.pronunciation.accuracyLabel')}
            </div>
            <div
              className={`text-5xl font-black tabular-nums ${
                isGood ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {overall}
              <span className="text-2xl text-muted-foreground"> /100</span>
            </div>
          </div>
          <Badge
            className={`rounded-xl font-bold px-3 py-1 text-base gap-1 ${
              isGood
                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
            }`}
          >
            {isGood ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {isGood ? t('ai.pronunciation.badgeGood') : t('ai.pronunciation.badgePractice')}
          </Badge>
        </div>

        <Progress value={overall} className="h-3" />

        <div className="text-sm font-medium text-muted-foreground">
          {data.feedback}
        </div>
      </Card>

      <Card className="rounded-3xl border-4 p-6 space-y-3">
        <h3 className="font-black text-lg">{t('ai.pronunciation.targetTitle')}</h3>
        <div className="rounded-2xl bg-muted/30 border-2 border-border p-3 text-base font-bold">
          {targetText}
        </div>

        <h3 className="font-black text-lg">{t('ai.pronunciation.transcribedTitle')}</h3>
        <div className="rounded-2xl bg-muted/30 border-2 border-border p-3 text-base font-medium italic">
          {data.transcribed_text}
        </div>

        {data.word_scores && data.word_scores.length > 0 && (
          <>
            <h3 className="font-black text-lg">{t('ai.pronunciation.wordScoresTitle')}</h3>
            <div className="flex flex-wrap gap-2">
              {data.word_scores.map((w, i) => (
                <WordScoreBadge key={i} item={w} />
              ))}
            </div>
          </>
        )}
      </Card>

      <Button
        onClick={onReset}
        variant="outline"
        className="rounded-2xl h-12 px-6 font-bold"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        {t('ai.pronunciation.again')}
      </Button>
    </div>
  );
}

function WordScoreBadge({ item }: { item: AIWordScore }) {
  const pct = Math.round(item.score * 100);
  const color =
    pct >= 80
      ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
      : pct >= 60
        ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
        : 'bg-destructive/15 text-destructive border-destructive/30';
  return (
    <Badge
      className={`rounded-xl border font-bold gap-1.5 ${color}`}
      title={item.feedback || `${pct}/100`}
    >
      <span>{item.word}</span>
      <span className="tabular-nums opacity-70">{pct}</span>
    </Badge>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}

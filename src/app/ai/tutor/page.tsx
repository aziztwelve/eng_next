'use client';

import { useState } from 'react';
import { GraduationCap, Loader2, RotateCcw, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuotaWidget, hasQuotaLeft } from '@/components/ai/quota-widget';
import { useAIQuota, useAskTutorStream } from '@/hooks/use-ai';
import { useLanguage } from '@/lib/i18n';

/**
 * /ai/tutor — однократный Q&A с typewriter-эффектом (Phase 5.X SSE).
 *
 * Без persistence — родственник `/ai/chat`, но без истории. Если нужен
 * контекст, сценарий → tutor_qa в обычном чате.
 */
export default function TutorPage() {
  const { t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [nativeLang, setNativeLang] = useState('ru');

  const langOptions = [
    { value: '', label: t('ai.tutor.none') },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
  ];

  const quota = useAIQuota();
  const stream = useAskTutorStream();
  const canChat = hasQuotaLeft(quota.data, 'chat');

  // Показываем результат, если стрим работает или уже есть финальный answer.
  const hasResult =
    stream.isStreaming || stream.answer !== null || !!stream.streamingText;
  // Текст для рендера: финальный answer (success) или промежуточный buffer.
  const displayText = stream.answer ?? stream.streamingText;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || !canChat) return;
    setSubmittedQuestion(q);
    try {
      await stream.ask({
        question: q,
        target_language: targetLang || undefined,
        native_language: nativeLang || undefined,
      });
    } catch (err) {
      console.error('tutor failed', err);
    }
  };

  const handleReset = () => {
    stream.reset();
    setQuestion('');
    setSubmittedQuestion('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-amber-500" />
          {t('ai.tutor.title')}
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          {t('ai.tutor.subtitle')}
        </p>
      </div>

      <QuotaWidget compact />

      {hasResult ? (
        <div className="space-y-4">
          <Card className="rounded-3xl border-4 p-6">
            <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-1">
              {t('ai.tutor.questionLabel')}
            </div>
            <div className="font-bold text-base mb-4">{submittedQuestion}</div>
            <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2">
              {t('ai.tutor.answerLabel')}
            </div>
            {displayText ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{displayText}</ReactMarkdown>
                {stream.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-0.5 bg-primary align-middle animate-pulse" />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('ai.tutor.thinking')}
              </div>
            )}
            {stream.error && (
              <div className="mt-4 text-sm font-medium text-destructive">
                {t('ai.tutor.error')}: {stream.error}
              </div>
            )}
          </Card>
          <Button
            onClick={handleReset}
            variant="outline"
            className="rounded-2xl h-12 px-6 font-bold"
            disabled={stream.isStreaming}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('ai.tutor.askNew')}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="rounded-3xl border-4 p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t('ai.tutor.targetLangLabel')}>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium w-full"
                >
                  {langOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('ai.tutor.nativeLangLabel')}>
                <select
                  value={nativeLang}
                  onChange={(e) => setNativeLang(e.target.value)}
                  className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium w-full"
                >
                  <option value="ru">{t('ai.tutor.russian')}</option>
                  <option value="en">{t('ai.tutor.english')}</option>
                </select>
              </Field>
            </div>

            <Field label={t('ai.tutor.yourQuestionLabel')}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('ai.tutor.questionPlaceholder')}
                rows={4}
                className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium w-full resize-y"
              />
            </Field>

            {!canChat && (
              <div className="text-sm font-medium text-destructive">
                {t('ai.tutor.quotaExhausted')}
              </div>
            )}

            {stream.error && (
              <div className="text-sm font-medium text-destructive">
                {t('ai.tutor.error')}: {stream.error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!canChat || stream.isStreaming || !question.trim()}
              className="rounded-2xl h-12 px-6 font-black bg-primary hover:bg-primary/90"
            >
              {stream.isStreaming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('ai.tutor.thinking')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('ai.tutor.askBtn')}
                </>
              )}
            </Button>
          </Card>
        </form>
      )}
    </div>
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

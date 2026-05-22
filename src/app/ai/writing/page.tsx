'use client';

import { useState } from 'react';
import { Loader2, PenLine, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AssessmentResult } from '@/components/ai/assessment-result';
import { QuotaWidget, hasQuotaLeft } from '@/components/ai/quota-widget';
import { useAIQuota, useAssessWriting } from '@/hooks/use-ai';
import { useLanguage } from '@/lib/i18n';

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
];

const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * /ai/writing — отправка эссе/текста + AssessmentResult после ответа.
 *
 * MIN_WORDS = 10 — иначе бэк вернёт мало смысла. Frontend guard.
 */
export default function WritingPage() {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [lang, setLang] = useState('en');
  const [level, setLevel] = useState('B1');

  const quota = useAIQuota();
  const mut = useAssessWriting();
  const canWrite = hasQuotaLeft(quota.data, 'writing');

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const tooShort = wordCount < 10;
  const submittable = !tooShort && canWrite && !mut.isPending;

  const handleSubmit = async () => {
    if (!submittable) return;
    try {
      await mut.mutateAsync({
        prompt: prompt.trim() || undefined,
        user_text: text,
        target_language: lang,
        user_level: level,
      });
    } catch (e) {
      console.error('writing assess failed', e);
    }
  };

  const handleReset = () => {
    mut.reset();
    setText('');
    setPrompt('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <PenLine className="h-8 w-8 text-blue-500" />
          {t('ai.writing.title')}
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          {t('ai.writing.subtitle')}
        </p>
      </div>

      <QuotaWidget compact />

      {mut.data ? (
        <div className="space-y-4">
          <AssessmentResult data={mut.data} />
          <Button
            onClick={handleReset}
            variant="outline"
            className="rounded-2xl h-12 px-6 font-bold"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('ai.writing.again')}
          </Button>
        </div>
      ) : (
        <Card className="rounded-3xl border-4 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={t('ai.writing.languageLabel')}>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium w-full"
              >
                {LANG_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('ai.writing.levelLabel')}>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium w-full"
              >
                {LEVEL_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={t('ai.writing.promptLabel')}>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('ai.writing.promptPlaceholder')}
              className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium w-full"
            />
          </Field>

          <Field label={t('ai.writing.textLabel')}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('ai.writing.textPlaceholder')}
              rows={10}
              className="rounded-xl border-2 bg-background px-3 py-2 text-base font-medium w-full resize-y"
            />
            <div className="text-xs text-muted-foreground font-medium mt-1">
              {t('ai.writing.wordsCount').replace('{n}', String(wordCount))}
              {tooShort && t('ai.writing.minWords')}
            </div>
          </Field>

          {!canWrite && (
            <div className="text-sm font-medium text-destructive">
              {t('ai.writing.quotaExhausted')}
            </div>
          )}

          {mut.isError && (
            <div className="text-sm font-medium text-destructive">
              {t('ai.writing.error')}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!submittable}
            className="rounded-2xl h-12 px-6 font-black bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            {mut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('ai.writing.submitting')}
              </>
            ) : (
              t('ai.writing.submit')
            )}
          </Button>
        </Card>
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

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/i18n';
import type { AIWritingFeedback, AssessWritingResponse } from '@/types/api';

/**
 * AssessmentResult — карточка с overall + 4 score'ами + corrected_text +
 * structured feedback по категориям. Используется на /ai/writing после
 * получения ответа.
 */
export function AssessmentResult({ data }: { data: AssessWritingResponse }) {
  const { t } = useLanguage();

  const scoreLabel = (v: number): string => {
    if (v >= 90) return t('ai.assessment.labelExcellent');
    if (v >= 75) return t('ai.assessment.labelGood');
    if (v >= 60) return t('ai.assessment.labelOk');
    if (v >= 40) return t('ai.assessment.labelWeak');
    return t('ai.assessment.labelBad');
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              {t('ai.assessment.overallScore')}
            </div>
            <div
              className={`text-5xl font-black tabular-nums ${scoreColor(data.overall_score)}`}
            >
              {data.overall_score}
              <span className="text-2xl text-muted-foreground"> /100</span>
            </div>
          </div>
          <Badge
            className={`rounded-xl font-bold px-3 py-1 text-base ${scoreBadge(data.overall_score)}`}
          >
            {scoreLabel(data.overall_score)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ScoreBar label={t('ai.assessment.grammar')} value={data.grammar_score} />
          <ScoreBar label={t('ai.assessment.vocabulary')} value={data.vocabulary_score} />
          <ScoreBar label={t('ai.assessment.coherence')} value={data.coherence_score} />
          <ScoreBar label={t('ai.assessment.style')} value={data.style_score} />
        </div>
      </Card>

      {data.corrected_text && (
        <Card className="rounded-3xl border-4 p-6 space-y-2">
          <h3 className="font-black text-lg">{t('ai.assessment.correctedTitle')}</h3>
          <div className="rounded-2xl bg-emerald-500/5 border-2 border-emerald-500/20 p-4 text-base font-medium leading-relaxed whitespace-pre-wrap">
            {data.corrected_text}
          </div>
        </Card>
      )}

      {data.feedback && data.feedback.length > 0 && (
        <Card className="rounded-3xl border-4 p-6 space-y-3">
          <h3 className="font-black text-lg">{t('ai.assessment.feedbackTitle')}</h3>
          <div className="space-y-2">
            {data.feedback.map((f, i) => (
              <FeedbackRow key={i} item={f} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-end justify-between">
        <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={`text-lg font-black tabular-nums ${scoreColor(value)}`}>
          {value}
        </span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

function FeedbackRow({ item }: { item: AIWritingFeedback }) {
  const { t } = useLanguage();
  const categoryLabel = (c: string): string => {
    switch (c) {
      case 'grammar':
        return t('ai.feedbackCategory.grammar');
      case 'vocabulary':
        return t('ai.feedbackCategory.vocabulary');
      case 'coherence':
        return t('ai.feedbackCategory.coherence');
      case 'style':
        return t('ai.feedbackCategory.style');
      default:
        return c;
    }
  };
  return (
    <div className="rounded-2xl border-2 border-border p-3 space-y-1">
      <div className="flex items-center gap-2">
        <Badge className={`rounded-lg uppercase font-bold ${categoryColor(item.category)}`}>
          {categoryLabel(item.category)}
        </Badge>
      </div>
      <div className="text-sm font-bold">{item.issue}</div>
      <div className="text-sm text-muted-foreground font-medium">
        💡 {item.suggestion}
      </div>
    </div>
  );
}

// === helpers ===

function scoreColor(v: number): string {
  if (v >= 80) return 'text-emerald-500';
  if (v >= 60) return 'text-amber-500';
  return 'text-destructive';
}

function scoreBadge(v: number): string {
  if (v >= 80) return 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30';
  if (v >= 60) return 'bg-amber-500/15 text-amber-600 border border-amber-500/30';
  return 'bg-destructive/15 text-destructive border border-destructive/30';
}

function categoryColor(c: string): string {
  switch (c) {
    case 'grammar':
      return 'bg-rose-500/15 text-rose-600';
    case 'vocabulary':
      return 'bg-blue-500/15 text-blue-600';
    case 'coherence':
      return 'bg-violet-500/15 text-violet-600';
    case 'style':
      return 'bg-amber-500/15 text-amber-600';
    default:
      return 'bg-muted text-foreground';
  }
}

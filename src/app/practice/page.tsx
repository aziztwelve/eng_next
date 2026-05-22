'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  Loader2,
  Play,
  Sparkles,
  Target,
  TrendingDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSrsStats, useMistakes, useWeakSkills } from '@/hooks/use-srs';
import { useLanguage } from '@/lib/i18n';

/**
 * /practice — лендинг для практики.
 *
 * Показывает SRS-stats (сколько карточек ждёт повторения), быстрые
 * ссылки на ошибки и weak-навыки, и большой CTA «Начать практику» →
 * `/practice/session`.
 */
export default function PracticeLandingPage() {
  const { t } = useLanguage();
  const stats = useSrsStats();
  const mistakes = useMistakes({ resolved: 'unresolved', limit: 1 });
  const weakSkills = useWeakSkills({ limit: 3 });

  const dueNow = stats.data?.due_now ?? 0;
  const total = stats.data?.total_items ?? 0;
  const unresolvedMistakes = mistakes.data?.total ?? 0;
  const hasWeakSkills = (weakSkills.data?.skills?.length ?? 0) > 0;

  const isLoading = stats.isLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          {t('practice.hub.title')}
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          {t('practice.hub.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : total === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Card className="rounded-3xl border-4 p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label={t('practice.hub.statsDue')} value={dueNow} accent="primary" />
              <Stat
                label={t('practice.hub.statsMastered')}
                value={stats.data?.mastered ?? 0}
                accent="success"
              />
              <Stat label={t('practice.hub.statsLearning')} value={stats.data?.learning ?? 0} />
              <Stat label={t('practice.hub.statsFresh')} value={stats.data?.fresh ?? 0} />
            </div>
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3 text-sm text-muted-foreground font-medium">
              <span>{t('practice.hub.totalCards').replace('{n}', String(total))}</span>
              <span>{t('practice.hub.reviewedToday').replace('{n}', String(stats.data?.reviewed_today ?? 0))}</span>
            </div>
          </Card>

          <Card className="rounded-3xl border-4 p-6 bg-primary/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Play className="h-6 w-6" />
                  {t('practice.hub.startTitle')}
                </h2>
                <p className="text-muted-foreground font-medium">
                  {dueNow > 0
                    ? t('practice.hub.startDescDue').replace('{n}', String(dueNow))
                    : t('practice.hub.startDescNoDue')}
                </p>
              </div>
              <Button
                asChild
                className="rounded-2xl h-14 px-8 font-black text-lg shadow-[0_4px_0_0_#0e7490] bg-primary hover:bg-primary/90"
              >
                <Link href="/practice/session">
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  {t('practice.hub.startCta')}
                </Link>
              </Button>
            </div>
          </Card>
        </>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/practice/mistakes" className="group">
          <Card className="rounded-3xl border-4 p-6 h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-black text-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {t('practice.hub.cardMistakesTitle')}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('practice.hub.cardMistakesDesc')}
                </p>
              </div>
              {unresolvedMistakes > 0 && (
                <Badge className="rounded-xl bg-orange-500 text-white font-black px-3 py-1 text-base">
                  {unresolvedMistakes}
                </Badge>
              )}
            </div>
          </Card>
        </Link>

        <Link href="/profile/strength" className="group">
          <Card className="rounded-3xl border-4 p-6 h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-black text-xl flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-amber-500" />
                  {t('practice.hub.cardWeakTitle')}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('practice.hub.cardWeakDesc')}
                </p>
              </div>
              {hasWeakSkills && (
                <Badge className="rounded-xl bg-amber-500 text-white font-black px-3 py-1 text-base">
                  {weakSkills.data?.skills?.length ?? 0}
                </Badge>
              )}
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'primary' | 'success';
}) {
  const color =
    accent === 'primary'
      ? 'text-primary'
      : accent === 'success'
        ? 'text-emerald-500'
        : 'text-foreground';
  return (
    <div>
      <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`text-3xl font-black tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function EmptyState() {
  const { t } = useLanguage();
  return (
    <Card className="rounded-3xl border-4 p-12 text-center space-y-4">
      <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
      <h2 className="text-2xl font-black">{t('practice.hub.emptyTitle')}</h2>
      <p className="text-muted-foreground font-medium max-w-md mx-auto">
        {t('practice.hub.emptyText')}
      </p>
      <Button asChild className="rounded-2xl h-12 px-6 font-bold">
        <Link href="/courses">
          <Target className="h-4 w-4 mr-2" />
          {t('practice.hub.emptyCta')}
        </Link>
      </Button>
    </Card>
  );
}

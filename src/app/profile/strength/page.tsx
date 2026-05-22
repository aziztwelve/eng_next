'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Layers, Loader2, TrendingDown, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSkillStrengths, useWeakSkills } from '@/hooks/use-srs';
import { tsToDate } from '@/lib/gamification-api';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { skillTypeShort, type SkillDecay, type SkillTypeShort } from '@/types/api';

type Filter = 'all' | 'module' | 'lesson';

/**
 * /profile/strength — карта силы навыков.
 *
 * Источник — `user_skill_decay`. Каждая запись = (user, skill_id), где
 * skill — это lesson или module. Карточки создаются автоматически из
 * `course-service.OnLessonCompleted`, ежедневный cron в srs-service
 * декрементирует `current_strength` по `decay_rate` (default 0.05/day).
 *
 * UI:
 *   - Топ-секция: «Топ слабых» (квадратики strength 0..1)
 *   - Основная: грид всех навыков (фильтр module / lesson / all),
 *     отсортирован от слабых к сильным.
 */
export default function StrengthPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');

  const skillType: SkillTypeShort | undefined =
    filter === 'all' ? undefined : filter;

  const weak = useWeakSkills({ skill_type: skillType, limit: 5 });
  const all = useSkillStrengths({ skill_type: skillType, limit: 100 });

  // Сортируем по current_strength ASC — слабые в начале.
  const sorted = useMemo(() => {
    const items = all.data?.skills ?? [];
    return [...items].sort((a, b) => a.current_strength - b.current_strength);
  }, [all.data]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Button asChild variant="ghost" className="rounded-xl font-bold w-fit">
        <Link href="/profile">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('profile.back')}
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary" />
          {t('profile.strength.title')}
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          {t('profile.strength.subtitle')}
        </p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="rounded-2xl border-2 p-1">
          <TabsTrigger value="all" className="rounded-xl font-bold px-4">
            {t('profile.strength.tabAll')}
          </TabsTrigger>
          <TabsTrigger value="module" className="rounded-xl font-bold px-4">
            {t('profile.strength.tabModules')}
          </TabsTrigger>
          <TabsTrigger value="lesson" className="rounded-xl font-bold px-4">
            {t('profile.strength.tabLessons')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Top weak */}
      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-black flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-500" />
            {t('profile.strength.weakTitle')}
          </h2>
          <Button asChild className="rounded-2xl h-10 px-5 font-bold">
            <Link href="/practice/session">{t('profile.strength.weakBoost')}</Link>
          </Button>
        </div>
        {weak.isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (weak.data?.skills?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground font-medium text-sm">
            {t('profile.strength.weakEmpty')}
          </p>
        ) : (
          <div className="grid gap-2">
            {weak.data?.skills?.map((s) => (
              <SkillBar key={`${s.user_id}:${s.skill_id}`} skill={s} />
            ))}
          </div>
        )}
      </Card>

      {/* All */}
      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <h2 className="text-xl font-black flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          {t('profile.strength.allTitle')} {sorted.length > 0 && <span className="text-muted-foreground font-bold text-base">· {sorted.length}</span>}
        </h2>

        {all.isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-muted-foreground font-medium text-sm">
            {t('profile.strength.allEmpty')}
          </p>
        ) : (
          <div className="grid gap-2">
            {sorted.map((s) => (
              <SkillBar key={`${s.user_id}:${s.skill_id}`} skill={s} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function SkillBar({ skill }: { skill: SkillDecay }) {
  const { t } = useLanguage();
  const pct = Math.round(Math.max(0, Math.min(1, skill.current_strength)) * 100);
  const last = tsToDate(skill.last_practiced_at ?? null);
  const kind = skillTypeShort(skill.skill_type);
  const color =
    pct >= 80
      ? 'bg-emerald-500'
      : pct >= 50
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {kind && (
            <Badge variant="outline" className="rounded-full border-2 font-bold uppercase">
              {kind === 'module' ? t('profile.strength.badgeModule') : t('profile.strength.badgeLesson')}
            </Badge>
          )}
          <span className="font-mono text-muted-foreground truncate">
            {skill.skill_id}
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden p-0.5 border-2">
          <div
            className={cn('h-full rounded-full transition-all', color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="text-right whitespace-nowrap">
        <div className="font-black tabular-nums text-lg">{pct}%</div>
        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
          {last ? last.toLocaleDateString() : '—'}
        </div>
      </div>
    </div>
  );
}

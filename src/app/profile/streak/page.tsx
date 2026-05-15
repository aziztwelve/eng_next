'use client';

import Link from 'next/link';
import { ArrowLeft, Flame, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StreakCalendar } from '@/components/gamification';
import { useUserStats } from '@/hooks/use-user-stats';
import { useUseFreeze } from '@/hooks/use-streak';
import { useLanguage } from '@/lib/i18n';

export default function StreakPage() {
  const { t } = useLanguage();
  const { data: stats } = useUserStats();
  const useFreeze = useUseFreeze();

  const onFreeze = () => {
    if (!confirm('Активировать streak freeze? Будет потрачен 1 freeze.')) return;
    useFreeze.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Button asChild variant="ghost" className="rounded-xl font-bold w-fit">
        <Link href="/profile">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Link>
      </Button>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <Flame className="h-8 w-8 text-orange-500 fill-current" />
          {t('common.streak')}
        </h1>
        <Button
          onClick={onFreeze}
          disabled={!stats || stats.streak_freezes <= 0 || useFreeze.isPending}
          className="rounded-2xl h-12 px-5 font-bold shadow-[0_4px_0_0_#0e7490] bg-cyan-500 hover:bg-cyan-500/90 text-white"
        >
          <Snowflake className="h-4 w-4 mr-2" />
          Freeze · {stats?.streak_freezes ?? 0}
        </Button>
      </div>

      <Card className="rounded-3xl border-4 p-6 grid grid-cols-3 gap-4">
        <Stat label="Current" value={stats?.current_streak ?? 0} />
        <Stat label="Max" value={stats?.max_streak ?? 0} />
        <Stat label="Freezes" value={stats?.streak_freezes ?? 0} />
      </Card>

      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <h2 className="text-xl font-black">Последние 30 дней</h2>
        <StreakCalendar days={30} />
        <div className="flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
          <Legend color="bg-emerald-500" label="completed" />
          <Legend color="bg-cyan-500" label="freeze" />
          <Legend color="bg-muted" label="missed" />
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-3xl font-black tabular-nums">{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-3 w-3 rounded ${color}`} />
      {label}
    </div>
  );
}

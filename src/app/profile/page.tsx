'use client';

import Link from 'next/link';
import { Award, BarChart3, Bell, Flame, Heart, Layers, Star, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStats } from '@/hooks/use-user-stats';
import { useMyAchievements } from '@/hooks/use-achievements';
import {
  DailyGoalRing,
  HeartCounter,
  LevelBadge,
  StreakBadge,
  XPBar,
  AchievementCard,
} from '@/components/gamification';
import { useLanguage } from '@/lib/i18n';
import { tsToDate } from '@/lib/gamification-api';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { data: stats, isLoading } = useUserStats();
  const mine = useMyAchievements();

  const recent = (mine.data?.achievements ?? [])
    .slice()
    .sort((a, b) => {
      const da = tsToDate(a.unlocked_at)?.getTime() ?? 0;
      const db = tsToDate(b.unlocked_at)?.getTime() ?? 0;
      return db - da;
    })
    .slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl sm:text-4xl font-black">{t('common.profile')}</h1>
        <LevelBadge size="lg" />
      </div>

      <Card className="rounded-3xl border-4 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat icon={<Star className="h-5 w-5 text-amber-500 fill-current" />} label="Level" value={stats?.level ?? '—'} />
        <Stat icon={<Zap className="h-5 w-5 text-amber-500 fill-current" />} label="Total XP" value={stats?.total_xp ?? 0} />
        <Stat icon={<Flame className="h-5 w-5 text-orange-500 fill-current" />} label="Streak" value={stats?.current_streak ?? 0} />
        <Stat icon={<Heart className="h-5 w-5 text-red-500 fill-current" />} label="Hearts" value={`${stats?.hearts ?? 0}/${stats?.max_hearts ?? 0}`} />
      </Card>

      <Card className="rounded-3xl border-4 p-6 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <DailyGoalRing size={140} />
        <div className="space-y-3">
          <h2 className="font-black text-xl">{t('common.dailyGoal')}</h2>
          <XPBar />
          <div className="flex items-center gap-3 flex-wrap">
            <StreakBadge size="lg" />
            <HeartCounter />
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">{t('common.achievements')}</h2>
          <Button asChild variant="outline" className="rounded-xl border-2 font-bold">
            <Link href="/profile/achievements">
              <Award className="h-4 w-4 mr-2" />
              Все
            </Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted-foreground font-medium">
            {isLoading ? '…' : 'Пока ни одного достижения. Завершите первый шаг!'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recent.map((ua) => (
              <AchievementCard key={ua.achievement.id} achievement={ua.achievement} user={ua} />
            ))}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-3 gap-3">
        <Button asChild variant="outline" className="rounded-2xl border-4 h-14 font-bold">
          <Link href="/profile/stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('common.stats')}
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-2xl border-4 h-14 font-bold">
          <Link href="/profile/streak">
            <Flame className="h-4 w-4 mr-2" />
            {t('common.streak')}
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-2xl border-4 h-14 font-bold">
          <Link href="/profile/achievements">
            <Award className="h-4 w-4 mr-2" />
            {t('common.achievements')}
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-2xl border-4 h-14 font-bold">
          <Link href="/profile/strength">
            <Layers className="h-4 w-4 mr-2" />
            Сила навыков
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-2xl border-4 h-14 font-bold">
          <Link href="/profile/notifications">
            <Bell className="h-4 w-4 mr-2" />
            Уведомления
          </Link>
        </Button>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-black tabular-nums">{value}</div>
    </div>
  );
}

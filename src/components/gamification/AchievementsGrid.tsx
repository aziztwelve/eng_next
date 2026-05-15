'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAchievements, useMyAchievements } from '@/hooks/use-achievements';
import { AchievementCard } from './AchievementCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserAchievement } from '@/types/api';

const CATEGORIES = ['all', 'learning', 'streak', 'xp', 'special'] as const;
type Category = (typeof CATEGORIES)[number];

export function AchievementsGrid({ className }: { className?: string }) {
  const [category, setCategory] = useState<Category>('all');
  const all = useAchievements(category === 'all' ? undefined : { category });
  const mine = useMyAchievements();

  const ownedMap = useMemo(() => {
    const m = new Map<string, UserAchievement>();
    mine.data?.achievements?.forEach((ua) => {
      if (ua.achievement?.id) m.set(ua.achievement.id, ua);
    });
    return m;
  }, [mine.data]);

  const isLoading = all.isLoading || mine.isLoading;

  const items = all.data?.achievements ?? [];
  const unlocked = items.filter((a) => ownedMap.has(a.id));
  const locked = items.filter((a) => !ownedMap.has(a.id));

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            size="sm"
            onClick={() => setCategory(c)}
            variant={category === c ? 'default' : 'outline'}
            className={cn(
              'rounded-full font-bold capitalize',
              category === c && 'shadow-[0_3px_0_0_#46a302]',
            )}
          >
            {c}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {unlocked.length > 0 && (
            <Section title={`Получены · ${unlocked.length}`}>
              {unlocked.map((a) => (
                <AchievementCard key={a.id} achievement={a} user={ownedMap.get(a.id)} />
              ))}
            </Section>
          )}
          {locked.length > 0 && (
            <Section title={`Заблокированы · ${locked.length}`}>
              {locked.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))}
            </Section>
          )}
          {items.length === 0 && (
            <p className="text-center text-muted-foreground font-medium py-8">
              Достижений пока нет.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{children}</div>
    </section>
  );
}

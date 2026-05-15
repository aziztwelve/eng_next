'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AchievementsGrid } from '@/components/gamification';
import { useLanguage } from '@/lib/i18n';

export default function AchievementsPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Button asChild variant="ghost" className="rounded-xl font-bold w-fit">
        <Link href="/profile">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Link>
      </Button>
      <h1 className="text-3xl sm:text-4xl font-black">{t('common.achievements')}</h1>
      <AchievementsGrid />
    </div>
  );
}

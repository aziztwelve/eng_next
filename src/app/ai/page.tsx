'use client';

import Link from 'next/link';
import {
  BookOpen,
  Bot,
  Drama,
  GraduationCap,
  Mic,
  PenLine,
  Sparkles,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { QuotaWidget } from '@/components/ai/quota-widget';
import { useLanguage } from '@/lib/i18n';

/**
 * /ai — hub-страница AI-фич. 5 карточек + quota widget сверху.
 * Все фичи требуют auth; quota widget сам обрабатывает loading state.
 */
export default function AIHubPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          {t('ai.hub.title')}
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          {t('ai.hub.subtitle')}
        </p>
      </div>

      <QuotaWidget />

      <div className="grid sm:grid-cols-2 gap-4">
        <FeatureCard
          href="/ai/chat"
          icon={<Sparkles className="h-6 w-6 text-primary" />}
          title={t('ai.hub.cards.freeChatTitle')}
          description={t('ai.hub.cards.freeChatDesc')}
        />
        <FeatureCard
          href="/ai/roleplay"
          icon={<Drama className="h-6 w-6 text-rose-500" />}
          title={t('ai.hub.cards.roleplayTitle')}
          description={t('ai.hub.cards.roleplayDesc')}
        />
        <FeatureCard
          href="/ai/writing"
          icon={<PenLine className="h-6 w-6 text-blue-500" />}
          title={t('ai.hub.cards.writingTitle')}
          description={t('ai.hub.cards.writingDesc')}
        />
        <FeatureCard
          href="/ai/tutor"
          icon={<GraduationCap className="h-6 w-6 text-amber-500" />}
          title={t('ai.hub.cards.tutorTitle')}
          description={t('ai.hub.cards.tutorDesc')}
        />
        <FeatureCard
          href="/ai/pronunciation"
          icon={<Mic className="h-6 w-6 text-emerald-500" />}
          title={t('ai.hub.cards.pronunciationTitle')}
          description={t('ai.hub.cards.pronunciationDesc')}
        />
        <FeatureCard
          href="/ai/chat"
          icon={<BookOpen className="h-6 w-6 text-violet-500" />}
          title={t('ai.hub.cards.historyTitle')}
          description={t('ai.hub.cards.historyDesc')}
        />
      </div>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="rounded-3xl border-4 p-6 h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-card border-2 border-border h-12 w-12 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="font-black text-xl">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground font-medium">{description}</p>
      </Card>
    </Link>
  );
}

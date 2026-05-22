'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Drama, Loader2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScenarioCard } from '@/components/ai/scenario-card';
import { QuotaWidget, hasQuotaLeft } from '@/components/ai/quota-widget';
import {
  useAIQuota,
  useAIScenarios,
  useStartConversation,
} from '@/hooks/use-ai';
import { useLanguage } from '@/lib/i18n';

/**
 * /ai/roleplay — каталог roleplay-сценариев. Клик по карточке стартует
 * conversation со scenario=`roleplay_<id>` и редиректит в /ai/chat/[id].
 */
export default function RoleplayPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const langOptions = [
    { value: '', label: t('ai.roleplay.allLanguages') },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
  ];

  const levelOptions = [
    { value: '', label: t('ai.roleplay.allLevels') },
    { value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'C1', label: 'C1' },
  ];

  const list = useAIScenarios({
    language: language || undefined,
    user_level: level || undefined,
  });
  const quota = useAIQuota();
  const startMut = useStartConversation();

  const scenarios = list.data?.scenarios ?? [];
  const canChat = hasQuotaLeft(quota.data, 'chat');

  const handleStart = async (scenarioId: string) => {
    if (!canChat) return;
    setPendingId(scenarioId);
    try {
      const sc = scenarios.find((s) => s.id === scenarioId);
      const resp = await startMut.mutateAsync({
        scenario: scenarioId.startsWith('roleplay_')
          ? scenarioId
          : `roleplay_${scenarioId}`,
        target_language: sc?.language || language || undefined,
        user_level: sc?.user_level || level || undefined,
        title: sc?.title,
      });
      router.push(`/ai/chat/${resp.conversation.id}`);
    } catch (e) {
      console.error('start roleplay failed', e);
      setPendingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <Drama className="h-8 w-8 text-rose-500" />
          {t('ai.roleplay.title')}
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          {t('ai.roleplay.subtitle')}
        </p>
      </div>

      <QuotaWidget compact />

      {!canChat && (
        <Card className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-4 text-sm font-medium">
          {t('ai.roleplay.quotaExhausted')}
        </Card>
      )}

      <Card className="rounded-3xl border-4 p-4 flex flex-wrap items-center gap-3">
        <Badge className="rounded-xl bg-muted text-foreground font-bold">
          {t('ai.roleplay.filtersBadge')}
        </Badge>
        <Selector
          label={t('ai.roleplay.languageLabel')}
          value={language}
          onChange={setLanguage}
          options={langOptions}
        />
        <Selector
          label={t('ai.roleplay.levelLabel')}
          value={level}
          onChange={setLevel}
          options={levelOptions}
        />
      </Card>

      {list.isLoading ? (
        <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </Card>
      ) : scenarios.length === 0 ? (
        <Card className="rounded-3xl border-4 p-12 text-center text-muted-foreground font-medium">
          {t('ai.roleplay.emptyFiltered')}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {scenarios.map((s) => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              loading={pendingId === s.id && startMut.isPending}
              onStart={handleStart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Selector({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm font-bold text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border-2 bg-background px-3 py-1.5 text-sm font-medium"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

'use client';

import { Loader2, Play, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import type { AIScenario } from '@/types/api';

/**
 * ScenarioCard — карточка одного roleplay-сценария.
 * onStart вызывается при клике "Начать" — родитель решает, как поднять
 * conversation (StartConversation + редирект на /ai/chat/[id]).
 */
export function ScenarioCard({
  scenario,
  loading = false,
  onStart,
}: {
  scenario: AIScenario;
  loading?: boolean;
  onStart: (scenarioId: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <Card className="rounded-3xl border-4 p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1">
          <h3 className="font-black text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            {scenario.title}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            {scenario.description}
          </p>
        </div>
        <Badge className="rounded-xl bg-primary/15 text-primary font-bold uppercase shrink-0">
          {scenario.user_level || '—'}
        </Badge>
      </div>

      {scenario.ai_role && (
        <div className="text-xs">
          <span className="font-bold text-muted-foreground uppercase tracking-wider">
            {t('ai.scenarioCard.aiRoleLabel')}{' '}
          </span>
          <span className="font-medium">{scenario.ai_role}</span>
        </div>
      )}

      {scenario.vocabulary_focus && scenario.vocabulary_focus.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {scenario.vocabulary_focus.slice(0, 6).map((w) => (
            <Badge
              key={w}
              variant="secondary"
              className="rounded-lg font-medium text-xs"
            >
              {w}
            </Badge>
          ))}
        </div>
      )}

      <Button
        onClick={() => onStart(scenario.id)}
        disabled={loading}
        className="rounded-2xl h-11 font-black mt-auto bg-primary hover:bg-primary/90"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Play className="h-4 w-4 mr-2 fill-current" />
        )}
        {t('ai.scenarioCard.startBtn')}
      </Button>
    </Card>
  );
}

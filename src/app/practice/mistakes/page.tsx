'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMistakes } from '@/hooks/use-srs';
import { tsToDate } from '@/lib/gamification-api';
import type { Mistake, MistakeFilter } from '@/types/api';

const PAGE_SIZE = 20;

/**
 * /practice/mistakes — список ошибок пользователя.
 *
 * Источник правды — `user_mistakes` в srs-service. Записи отмечаются
 * `is_resolved=TRUE` автоматически при первом корректном ответе на тот же
 * шаг (см. step-validation.recordSRS). Здесь — только просмотр.
 */
export default function MistakesPage() {
  const [tab, setTab] = useState<MistakeFilter>('unresolved');
  const [page, setPage] = useState(0);

  // Сбрасываем пагинацию при переключении таба.
  const onTabChange = (v: string) => {
    setTab(v as MistakeFilter);
    setPage(0);
  };

  const q = useMistakes({
    resolved: tab,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const list = q.data?.mistakes ?? [];
  const total = q.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Button asChild variant="ghost" className="rounded-xl font-bold w-fit">
        <Link href="/practice">
          <ArrowLeft className="w-4 h-4 mr-2" />
          К практике
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          Ошибки
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          Шаги, на которых вы запинались. Снимаются автоматически, когда
          вы отвечаете правильно на тот же шаг.
        </p>
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList className="rounded-2xl border-2 p-1">
          <TabsTrigger value="unresolved" className="rounded-xl font-bold px-4">
            Не исправлены
          </TabsTrigger>
          <TabsTrigger value="resolved" className="rounded-xl font-bold px-4">
            Исправлены
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-xl font-bold px-4">
            Все
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {q.isLoading ? (
        <Card className="rounded-3xl border-4 p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : list.length === 0 ? (
        <Card className="rounded-3xl border-4 p-12 text-center space-y-2">
          <h2 className="text-xl font-black">Здесь пусто</h2>
          <p className="text-muted-foreground font-medium">
            {tab === 'unresolved'
              ? 'Все ошибки исправлены — отличная работа!'
              : tab === 'resolved'
                ? 'Пока нет исправленных ошибок.'
                : 'У вас ещё нет зарегистрированных ошибок.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
            <MistakeRow key={m.id} mistake={m} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-bold text-muted-foreground tabular-nums">
            Страница {page + 1} / {totalPages} · всего {total}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || q.isFetching}
              variant="outline"
              className="rounded-2xl border-2 h-11 px-4 font-bold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <Button
              onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
              disabled={page + 1 >= totalPages || q.isFetching}
              variant="outline"
              className="rounded-2xl border-2 h-11 px-4 font-bold"
            >
              Вперёд
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MistakeRow({ mistake }: { mistake: Mistake }) {
  const last = tsToDate(mistake.last_made_at ?? null);
  const resolved = mistake.is_resolved;
  return (
    <Card className="rounded-2xl border-4 p-4 sm:p-5 flex items-start justify-between gap-4 flex-wrap">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {resolved ? (
            <Badge className="rounded-full bg-emerald-500 text-white font-bold gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Исправлено
            </Badge>
          ) : (
            <Badge className="rounded-full bg-orange-500 text-white font-bold gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              Не исправлено
            </Badge>
          )}
          <span className="text-sm font-bold tabular-nums text-muted-foreground">
            ×{mistake.times_made}
          </span>
        </div>
        <div className="font-mono text-xs text-muted-foreground break-all">
          step: {mistake.step_id}
        </div>
        {mistake.incorrect_answer && Object.keys(mistake.incorrect_answer).length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer font-bold text-muted-foreground hover:text-foreground">
              Ваш ответ
            </summary>
            <pre className="mt-2 rounded-lg bg-muted p-3 overflow-auto max-h-40 whitespace-pre-wrap break-words">
              {JSON.stringify(mistake.incorrect_answer, null, 2)}
            </pre>
          </details>
        )}
      </div>
      <div className="text-xs text-muted-foreground font-bold whitespace-nowrap">
        {last ? last.toLocaleDateString() : '—'}
      </div>
    </Card>
  );
}

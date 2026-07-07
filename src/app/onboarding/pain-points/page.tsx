"use client";

import Link from 'next/link';
import { Mascot } from '@/components/onboarding/Mascot';

/**
 * Placeholder — полноценный шаг pain-points реализуется в Sprint 3
 * (вместе со speaking-situation / past-blocker / future-regret /
 * emotional-reaction / reminder-time + reaction-интерстициалы).
 *
 * Пока показываем заглушку, чтобы flow welcome → daily-commit не упирался
 * в 404 на ручном smoke-тесте.
 */
export default function PainPointsPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <Mascot pose="thumbs_up" size={140} />
      <h1 className="text-2xl font-black">Отлично, базовая часть готова!</h1>
      <p className="max-w-md text-muted-foreground font-medium">
        Эмоциональные шаги и интерстициалы появятся в Sprint 3. Базовый профиль
        (язык, цель, возраст, уровень, ежедневная цель) уже сохранён на сервере.
      </p>
      <Link
        href="/dashboard"
        className="rounded-2xl bg-primary px-8 h-12 inline-flex items-center font-black text-primary-foreground shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all"
      >
        На дашборд
      </Link>
    </div>
  );
}

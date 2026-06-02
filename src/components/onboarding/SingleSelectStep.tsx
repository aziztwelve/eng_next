/**
 * SingleSelectStep — общий компонент для шагов 2-11 (single-select из
 * списка). Берёт title/sub из i18n, рендерит OptionCard'ы внутри
 * CollapsibleOptions, при выборе показывает CTA "Продолжить".
 *
 * Не вшит в конкретный flow — каждая страница сама решает что PATCH'ить
 * и куда роутить. Это позволяет step'ам делать domain-specific преобразования
 * (например `goal` оборачивает choice в `motivation: [value]`).
 */

"use client";

import { useState } from 'react';

import { OptionCard } from './OptionCard';
import { CollapsibleOptions } from './CollapsibleOptions';
import { ContinueButton } from './OnboardingFooter';
import { useLanguage } from '@/lib/i18n';

export interface SingleSelectOption {
  /** Stable enum value, отправляется на backend. */
  id: string;
  emoji?: string;
  /** i18n key для title — `onboarding.<step>.options.<id>.title`. */
  titleKey: string;
  /** i18n key для subtitle (опц.) — `.sub`. */
  subKey?: string;
}

export interface SingleSelectStepProps {
  /** i18n key для главного заголовка экрана. */
  titleKey: string;
  /** i18n key для подзаголовка (опц.). */
  subKey?: string;
  options: SingleSelectOption[];
  /** Начальный выбор (пришёл с backend'а). */
  initial?: string | null;
  /** Вызывается при `Продолжить`. Должен сохранить и зароутить. */
  onContinue: (id: string) => Promise<void> | void;
  pending?: boolean;
}

export function SingleSelectStep({
  titleKey,
  subKey,
  options,
  initial,
  onContinue,
  pending,
}: SingleSelectStepProps) {
  const { t } = useLanguage();
  const [picked, setPicked] = useState<string | null>(initial ?? null);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl md:text-3xl font-black leading-tight">
          {t(titleKey)}
        </h1>
        {subKey && (
          <p className="text-muted-foreground font-medium">{t(subKey)}</p>
        )}
      </div>

      <CollapsibleOptions selectedId={picked}>
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            emoji={opt.emoji}
            title={t(opt.titleKey)}
            subtitle={opt.subKey ? t(opt.subKey) : undefined}
            selected={picked === opt.id}
            onSelect={() => setPicked(picked === opt.id ? null : opt.id)}
            disabled={pending}
          />
        ))}
      </CollapsibleOptions>

      <ContinueButton
        onClick={() => picked && onContinue(picked)}
        disabled={!picked}
        pending={pending}
      />
    </div>
  );
}

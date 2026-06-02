/**
 * UI-language switcher для шапки онбординга. Использует существующий
 * `useLanguage()` (4 локали ru/en/uz/tg). Простой `<select>` без Radix —
 * для шапки достаточно нативного pop-up.
 */

"use client";

import { useLanguage, LANGUAGES, type Language } from '@/lib/i18n';
import { ChevronDown } from 'lucide-react';

export function UiLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <label className="relative inline-flex items-center gap-1 rounded-xl border-2 border-border/50 bg-card px-3 py-2 text-sm font-bold cursor-pointer hover:border-primary/40 transition-colors">
      <span aria-hidden>{flagFor(language)}</span>
      <span className="uppercase">{language}</span>
      <ChevronDown className="h-3 w-3 ml-0.5 opacity-60" aria-hidden />
      <select
        className="absolute inset-0 opacity-0 cursor-pointer"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        aria-label="Interface language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function flagFor(lang: Language): string {
  switch (lang) {
    case 'ru': return '🇷🇺';
    case 'en': return '🇬🇧';
    case 'uz': return '🇺🇿';
    case 'tg': return '🇹🇯';
  }
}

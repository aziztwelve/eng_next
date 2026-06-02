"use client";

import { useEffect } from 'react';
import { ensureGuestSession } from '@/lib/onboarding/guest-session';

/**
 * Бутстрапает guest-сессию при первом mount'е (если ещё нет JWT).
 * Используется как side-effect в root layout — рендеринга не делает.
 */
export function useGuestSessionBootstrap() {
  useEffect(() => {
    void ensureGuestSession();
  }, []);
}

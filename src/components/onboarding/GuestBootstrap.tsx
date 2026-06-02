"use client";

import { useGuestSessionBootstrap } from '@/hooks/use-guest-session';

/**
 * Вставляется в root layout. Side-effect компонент, ничего не рендерит —
 * просто триггерит `ensureGuestSession()` на mount.
 *
 * Не делаем этого напрямую в `RootLayout`, потому что layout — server
 * component, а ensureGuestSession должен жить на клиенте.
 */
export function GuestBootstrap() {
  useGuestSessionBootstrap();
  return null;
}

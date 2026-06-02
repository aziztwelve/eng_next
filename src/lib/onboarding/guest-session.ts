/**
 * Guest session bootstrap для онбординга v3.
 *
 * При первом open приложения (из root layout, см. §3.4 web-спеки):
 *   1. Берём device_id из localStorage (или генерируем uuid v4 и сохраняем).
 *   2. Если уже есть JWT в `AuthService` — ничего не делаем.
 *   3. Иначе POST /auth/guest { device_id } → получаем guest JWT и сохраняем
 *      через `AuthService.saveAuthResponse` — это автоматически триггерит
 *      `AUTH_CHANGED_EVENT`, и все хуки (вкл. `useIsAuthenticated`) узнают
 *      о новой сессии.
 *
 * Race-conditions защищаем простым flag'ом `bootstrapping`: если уже идёт
 * запрос — все последующие вызовы дожидаются того же promise'а. На уровне
 * нескольких вкладок защиты нет, но gateway`uq_users_guest_device` индекс
 * гарантирует, что для одного `device_id` будет ровно один guest user_id —
 * вторая вкладка получит **тот же** user_id что и первая.
 */

import { ApiClient } from '@/lib/api-client';
import { AuthService } from '@/lib/auth-service';
import type { AuthResponse } from '@/types/api';

const DEVICE_ID_KEY = 'device_id';

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    // SSR-safe: возвращаем псевдо-ID, реальный device_id мы создадим
    // только при client-mount'е. Server-side bootstrap нам всё равно не нужен.
    return 'ssr-noop';
  }
  let id: string | null = null;
  try {
    id = window.localStorage.getItem(DEVICE_ID_KEY);
  } catch {
    /* localStorage заблокирован — fall through */
  }
  if (!id) {
    id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      window.localStorage.setItem(DEVICE_ID_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

let bootstrapping: Promise<void> | null = null;

/**
 * Гарантирует, что в `AuthService` есть какой-то JWT (guest или registered).
 * Идемпотентный — повторный вызов при существующем токене ничего не делает.
 */
export async function ensureGuestSession(): Promise<void> {
  if (typeof window === 'undefined') return;

  const existing = await AuthService.getAccessToken();
  if (existing) return;

  if (bootstrapping) return bootstrapping;

  bootstrapping = (async () => {
    try {
      const deviceId = getOrCreateDeviceId();
      const resp = await ApiClient.post<AuthResponse>('/auth/guest', { device_id: deviceId });
      await AuthService.saveAuthResponse(resp);
    } catch (err) {
      // Сетевые ошибки не пропагандируем — UI всё равно покажет "loading"
      // на онбординге; повторим попытку при следующем mount'е.
      // eslint-disable-next-line no-console
      console.warn('[onboarding] guest bootstrap failed', err);
    } finally {
      bootstrapping = null;
    }
  })();

  return bootstrapping;
}

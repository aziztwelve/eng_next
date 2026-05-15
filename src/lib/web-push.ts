/**
 * Web Push helpers — регистрация SW, subscribe / unsubscribe.
 *
 * Backend (notifications-service) ждёт три поля от Web Push клиента:
 *   - endpoint  : полный URL пуш-сервиса браузера
 *   - p256dh    : public key (base64url) из subscription.getKey('p256dh')
 *   - auth      : auth secret (base64url) из subscription.getKey('auth')
 *
 * VAPID public key берём из `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Без неё
 * push'и физически работать не будут — UI должен честно показать
 * "push not configured" вместо тихого фейла.
 */

import { ApiClient } from './api-client';

// Платформа web использует одно значение `token` per device. У W3C/Push API
// есть только endpoint+keys, токеном выступает endpoint (он уникален и
// стабилен per browser-profile). Backend дедупит по (user_id, platform,
// token) — поэтому "token" = endpoint.

export type PushSupportStatus =
  | 'supported'
  | 'no_service_worker'
  | 'no_push_manager'
  | 'no_notification'
  | 'no_vapid_key';

export interface SupportInfo {
  status: PushSupportStatus;
  vapidPublicKey: string | null;
}

export function getVapidPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  return key && key.length > 0 ? key : null;
}

/** Проверка browser-API. Не выполняет I/O, безопасно вызывать в SSR. */
export function detectPushSupport(): SupportInfo {
  const vapidPublicKey = getVapidPublicKey();
  if (typeof window === 'undefined') {
    return { status: 'no_service_worker', vapidPublicKey };
  }
  if (!('serviceWorker' in navigator)) {
    return { status: 'no_service_worker', vapidPublicKey };
  }
  if (!('PushManager' in window)) {
    return { status: 'no_push_manager', vapidPublicKey };
  }
  if (!('Notification' in window)) {
    return { status: 'no_notification', vapidPublicKey };
  }
  if (!vapidPublicKey) {
    return { status: 'no_vapid_key', vapidPublicKey };
  }
  return { status: 'supported', vapidPublicKey };
}

/** base64url-string → ArrayBuffer (для applicationServerKey). */
function urlBase64ToBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) {
    view[i] = raw.charCodeAt(i);
  }
  return buf;
}

/** ArrayBuffer → base64url (без padding, как ждёт RFC 8291). */
function bufToBase64Url(buf: ArrayBuffer | null | undefined): string {
  if (!buf) return '';
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const SW_URL = '/sw.js';
const SW_SCOPE = '/';

/** Регистрирует SW (idempotent). Возвращает active registration. */
export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  if (existing) return existing;
  return navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
}

/** Текущая подписка, если есть. Регистрирует SW, если нужно. */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  const support = detectPushSupport();
  if (support.status !== 'supported' && support.status !== 'no_vapid_key') {
    return null;
  }
  const reg = await ensureServiceWorker();
  return reg.pushManager.getSubscription();
}

/**
 * Подписывается в браузере + регистрирует device на бэке.
 *
 * Шаги:
 *   1. ensureServiceWorker
 *   2. Notification.requestPermission()
 *   3. pushManager.subscribe(applicationServerKey)
 *   4. POST /notifications/devices с endpoint + p256dh + auth
 *
 * Любая ошибка пробрасывается наверх — UI решает, как её показать.
 */
export async function subscribeToPush(): Promise<RegisterDeviceResponse> {
  const support = detectPushSupport();
  if (support.status !== 'supported' || !support.vapidPublicKey) {
    throw new Error(`push not supported: ${support.status}`);
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(`permission denied: ${permission}`);
  }

  const reg = await ensureServiceWorker();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToBuffer(support.vapidPublicKey),
    });
  }

  const p256dh = bufToBase64Url(sub.getKey?.('p256dh') ?? null);
  const auth = bufToBase64Url(sub.getKey?.('auth') ?? null);
  if (!p256dh || !auth) {
    throw new Error('subscription missing keys');
  }

  // Backend хранит device по (user_id, platform, token). У Web Push нет
  // отдельного "token" — endpoint выступает уникальным идентификатором.
  return ApiClient.post<RegisterDeviceResponse>('/notifications/devices', {
    platform: 'web',
    token: sub.endpoint,
    endpoint: sub.endpoint,
    p256dh,
    auth,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    locale: typeof navigator !== 'undefined' ? navigator.language : '',
  });
}

/**
 * Полное unsubscribe: на бэке (по device_id, если знаем) и в браузере.
 *
 * Если deviceId не передан — пытаемся unsubscribe только в браузере; на
 * бэке device осядет как unused/revoked после следующей попытки доставки.
 */
export async function unsubscribeFromPush(deviceId?: string): Promise<void> {
  if (deviceId) {
    try {
      await ApiClient.delete(`/notifications/devices/${encodeURIComponent(deviceId)}`);
    } catch {
      // не критично — даже если API упал, локально отписаться надо.
    }
  }
  const sub = await getExistingSubscription();
  if (sub) {
    await sub.unsubscribe();
  }
}

// Минимальный shape ответа RegisterDevice; полное определение — в types/api.
export interface RegisterDeviceResponse {
  device: {
    id: string;
    user_id: string;
    platform: string;
    token: string;
    endpoint?: string;
    revoked_at?: string | null;
  };
  created: boolean;
}

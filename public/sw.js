/* eng-notifications-sw v2
 *
 * Минимальный service worker для Web Push.
 * Регистрируется на window load (см. src/lib/web-push.ts).
 *
 * Контракт payload'а notifications-service (SendNotification):
 *   { title, body, data: { kind?, event?, deep_link?, url?, ...rest } }
 *
 * Resolve deep-link (по приоритету):
 *   1. data.url           — явное переопределение (legacy)
 *   2. data.deep_link     — конвенция social-service
 *   3. DEEPLINK_BY_EVENT[data.event]  — внутри-канальная дифференциация
 *   4. DEEPLINK_BY_KIND[data.kind]    — fallback на channel
 *   5. '/'
 *
 * Каналы:
 *   - practice_reminder → /practice
 *   - streak_risk       → /learn
 *   - daily_goal        → /
 *   - achievement       → /profile/achievements
 *   - friend_request    → /friends/pending (на event=friend_request) либо
 *                         /friends (на event=friend_accepted).
 */

const DEEPLINK_BY_KIND = {
  practice_reminder: '/practice',
  streak_risk: '/learn',
  daily_goal: '/',
  achievement: '/profile/achievements',
  friend_request: '/friends/pending',
};

const DEEPLINK_BY_EVENT = {
  friend_request: '/friends/pending',
  friend_accepted: '/friends',
};

self.addEventListener('install', () => {
  // Активируем сразу, без ожидания перезагрузки страниц.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    // Если backend прислал текст — покажем как тело.
    payload = { title: 'Notification', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'eng';
  const body = payload.body || '';
  const data = payload.data || {};

  const options = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data,
    tag: data.dedup_key || undefined,
    // Если у data есть `tag` — браузер заменит предыдущее уведомление с тем
    // же тегом (полезно для streak_risk, который иначе спамил бы).
    renotify: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const kind = data.kind || '';
  const ev = data.event || '';
  const url =
    data.url ||
    data.deep_link ||
    DEEPLINK_BY_EVENT[ev] ||
    DEEPLINK_BY_KIND[kind] ||
    '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Переиспользуем существующее окно, если есть.
      for (const client of clientList) {
        try {
          const u = new URL(client.url);
          if (u.origin === self.location.origin && 'focus' in client) {
            client.navigate(url).catch(() => {});
            return client.focus();
          }
        } catch {
          /* skip */
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
      return undefined;
    }),
  );
});

/* eng-notifications-sw v1
 *
 * Минимальный service worker для Web Push.
 * Регистрируется на window load (см. src/lib/web-push.ts).
 *
 * Контракт payload'а notifications-service (SendNotification):
 *   { title, body, data: { kind, ...rest } }
 *
 * Deep link определяется по `kind`:
 *   - practice_reminder → /practice
 *   - streak_risk       → /learn
 *   - daily_goal        → /
 *   - achievement       → /profile/achievements
 */

const DEEPLINK_BY_KIND = {
  practice_reminder: '/practice',
  streak_risk: '/learn',
  daily_goal: '/',
  achievement: '/profile/achievements',
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
  const url = data.url || DEEPLINK_BY_KIND[kind] || '/';

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

import { ApiClient } from './api-client';
import type {
  GetPreferencesResponse,
  ListDevicesResponse,
  ListNotificationsResponse,
  MarkReadResponse,
  NotificationsReadFilter,
  RegisterDeviceRequest,
  RegisterDeviceResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
} from '@/types/api';

/**
 * Phase 3: notifications-service через gateway.
 *
 * Gateway маршруты:
 *   # Devices
 *   POST   /api/v1/notifications/devices
 *   GET    /api/v1/notifications/devices
 *   DELETE /api/v1/notifications/devices/:id
 *   # Preferences
 *   GET    /api/v1/notifications/preferences
 *   PUT    /api/v1/notifications/preferences
 *   # Inbox
 *   GET    /api/v1/notifications?read=&limit=&offset=
 *   POST   /api/v1/notifications/:id/read
 *   POST   /api/v1/notifications/read-all
 *
 * Web Push subscribe / unsubscribe (browser-side) — см. lib/web-push.ts.
 */

function readFilterToParam(f: NotificationsReadFilter): string | null {
  if (f === 'unread') return 'unread';
  if (f === 'read') return 'read';
  return null;
}

export const NotificationsApi = {
  // === Devices ===
  registerDevice: (body: RegisterDeviceRequest) =>
    ApiClient.post<RegisterDeviceResponse>('/notifications/devices', body),

  listDevices: () => ApiClient.get<ListDevicesResponse>('/notifications/devices'),

  unregisterDevice: (id: string) =>
    ApiClient.delete<unknown>(`/notifications/devices/${encodeURIComponent(id)}`),

  // === Preferences ===
  getPreferences: () =>
    ApiClient.get<GetPreferencesResponse>('/notifications/preferences'),

  updatePreferences: (body: UpdatePreferencesRequest) =>
    ApiClient.put<UpdatePreferencesResponse>('/notifications/preferences', body),

  // === Inbox ===
  list: (
    opts: { read?: NotificationsReadFilter; limit?: number; offset?: number } = {},
  ) => {
    const qs = new URLSearchParams();
    const r = readFilterToParam(opts.read ?? 'all');
    if (r) qs.set('read', r);
    if (opts.limit) qs.set('limit', String(opts.limit));
    if (opts.offset) qs.set('offset', String(opts.offset));
    const q = qs.toString();
    return ApiClient.get<ListNotificationsResponse>(
      `/notifications${q ? `?${q}` : ''}`,
    );
  },

  markRead: (id: string) =>
    ApiClient.post<MarkReadResponse>(
      `/notifications/${encodeURIComponent(id)}/read`,
    ),

  markAllRead: () => ApiClient.post<MarkReadResponse>('/notifications/read-all'),
};

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useIsAuthenticated } from '@/hooks/use-auth';
import { NotificationsApi } from '@/lib/notifications-api';
import {
  detectPushSupport,
  ensureServiceWorker,
  getExistingSubscription,
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
  type PushSupportStatus,
} from '@/lib/web-push';
import type {
  NotificationsReadFilter,
  UpdatePreferencesRequest,
} from '@/types/api';

// === Query keys ===
export const NOTIF_PREFS_KEY = ['notifications', 'preferences'] as const;
export const NOTIF_DEVICES_KEY = ['notifications', 'devices'] as const;
export const NOTIF_INBOX_KEY = ['notifications', 'inbox'] as const;

// === Inbox ===

export function useNotifications(
  opts: { read?: NotificationsReadFilter; limit?: number; offset?: number } = {},
) {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: [
      ...NOTIF_INBOX_KEY,
      opts.read ?? 'all',
      opts.limit ?? 20,
      opts.offset ?? 0,
    ],
    queryFn: () => NotificationsApi.list(opts),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIF_INBOX_KEY }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIF_INBOX_KEY }),
  });
}

// === Preferences ===

export function useNotificationPreferences() {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: NOTIF_PREFS_KEY,
    queryFn: () => NotificationsApi.getPreferences(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePreferencesRequest) =>
      NotificationsApi.updatePreferences(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIF_PREFS_KEY }),
  });
}

// === Devices ===

export function useNotificationDevices() {
  const { isAuthenticated } = useIsAuthenticated();
  return useQuery({
    queryKey: NOTIF_DEVICES_KEY,
    queryFn: () => NotificationsApi.listDevices(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

// === Web Push subscribe / unsubscribe ===

export interface PushState {
  /** Поддержка browser-API + VAPID. */
  support: PushSupportStatus;
  /** "default" | "granted" | "denied" — текущая Notification permission. */
  permission: NotificationPermission | 'unsupported';
  /** Есть ли активная subscription в этом браузере. */
  subscribed: boolean;
  /** Завершена ли первичная detection-фаза (для рендера UI). */
  ready: boolean;
  /** Последняя ошибка (если была). */
  error: string | null;
}

const INITIAL_STATE: PushState = {
  support: 'no_service_worker',
  permission: 'unsupported',
  subscribed: false,
  ready: false,
  error: null,
};

/**
 * Хук состояния Web Push'а в текущем браузере.
 *
 * - Регистрирует SW, проверяет permission и наличие subscription.
 * - Предоставляет `subscribe()` / `unsubscribe()` с инвалидацией devices.
 * - НЕ инициирует subscription без явного вызова (UI решает, когда
 *   спрашивать пермишен).
 */
export function usePushSubscription() {
  const qc = useQueryClient();
  const [state, setState] = useState<PushState>(INITIAL_STATE);

  const refresh = useCallback(async () => {
    const supportInfo = detectPushSupport();
    const permission: PushState['permission'] =
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'unsupported';

    if (
      supportInfo.status === 'no_service_worker' ||
      supportInfo.status === 'no_push_manager' ||
      supportInfo.status === 'no_notification'
    ) {
      setState({
        support: supportInfo.status,
        permission,
        subscribed: false,
        ready: true,
        error: null,
      });
      return;
    }

    // SW можно зарегистрировать даже без VAPID — но не подписываться.
    try {
      await ensureServiceWorker();
    } catch (err) {
      setState({
        support: supportInfo.status,
        permission,
        subscribed: false,
        ready: true,
        error: err instanceof Error ? err.message : 'sw register failed',
      });
      return;
    }

    const sub = await getExistingSubscription().catch(() => null);
    setState({
      support: supportInfo.status,
      permission,
      subscribed: !!sub,
      ready: true,
      error: null,
    });
  }, []);

  // setState-in-effect здесь намеренно: browser-API (serviceWorker /
  // pushManager / Notification) недоступны в SSR, поэтому detection
  // делаем после монтирования и через `refresh()` обновляем локальный
  // снапшот.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const subscribeMut = useMutation({
    mutationFn: () => subscribeToPush(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIF_DEVICES_KEY });
      void refresh();
    },
    onError: (err) => {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'subscribe failed',
      }));
    },
  });

  const unsubscribeMut = useMutation({
    mutationFn: (deviceId?: string) => unsubscribeFromPush(deviceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIF_DEVICES_KEY });
      void refresh();
    },
    onError: (err) => {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'unsubscribe failed',
      }));
    },
  });

  return {
    state,
    vapidPublicKey: getVapidPublicKey(),
    refresh,
    subscribe: subscribeMut.mutate,
    subscribeAsync: subscribeMut.mutateAsync,
    isSubscribing: subscribeMut.isPending,
    unsubscribe: unsubscribeMut.mutate,
    unsubscribeAsync: unsubscribeMut.mutateAsync,
    isUnsubscribing: unsubscribeMut.isPending,
  };
}

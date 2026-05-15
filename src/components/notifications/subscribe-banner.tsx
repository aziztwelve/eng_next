'use client';

import Link from 'next/link';
import { Bell, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useIsAuthenticated } from '@/hooks/use-auth';
import { usePushSubscription } from '@/hooks/use-notifications';

const DISMISS_KEY = 'eng:push-banner:dismissed-at';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // не показываем 7 дней после "позже"

function isRecentlyDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < DISMISS_TTL_MS;
}

/**
 * Тонкий sticky-баннер с предложением включить push.
 *
 * Условия показа:
 *   - user authenticated;
 *   - browser поддерживает push + VAPID настроен;
 *   - Notification.permission === 'default' (ещё не спросили);
 *   - нет активной subscription;
 *   - пользователь не нажал «позже» в последние 7 дней.
 *
 * После «позже» / успешного subscribe баннер исчезает.
 */
export function SubscribeBanner() {
  const { isAuthenticated } = useIsAuthenticated();
  const push = usePushSubscription();
  const [dismissed, setDismissed] = useState(false);

  // setState-in-effect здесь намеренно: localStorage недоступен в SSR,
  // поэтому начальное состояние читаем после монтирования.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(isRecentlyDismissed());
  }, []);

  if (!isAuthenticated) return null;
  if (dismissed) return null;
  if (!push.state.ready) return null;
  if (push.state.support !== 'supported') return null;
  if (push.state.permission !== 'default') return null;
  if (push.state.subscribed) return null;

  const onLater = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setDismissed(true);
  };

  const onEnable = async () => {
    try {
      await push.subscribeAsync();
      toast.success('Push-уведомления включены');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Не удалось включить push',
      );
    }
  };

  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="rounded-2xl border-2 bg-card p-4 flex items-center gap-3 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Bell className="w-5 h-5 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="font-bold">Включить уведомления?</div>
            <div className="text-xs text-muted-foreground truncate">
              Напомним, когда подойдёт ревью, есть streak-risk или ачивка.{' '}
              <Link href="/profile/notifications" className="underline">
                подробнее
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onLater}
            className="rounded-xl font-bold"
          >
            Позже
          </Button>
          <Button
            size="sm"
            onClick={onEnable}
            disabled={push.isSubscribing}
            className="rounded-xl font-bold"
          >
            Включить
          </Button>
          <button
            aria-label="Закрыть"
            onClick={onLater}
            className="p-1 rounded-md hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

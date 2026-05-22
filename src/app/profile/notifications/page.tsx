'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, BellOff, Loader2, ShieldAlert, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  useNotificationDevices,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  usePushSubscription,
} from '@/hooks/use-notifications';
import { tsToDate } from '@/lib/gamification-api';
import { useLanguage } from '@/lib/i18n';
import { platformToShort, type DeviceToken, type UpdatePreferencesRequest } from '@/types/api';

/**
 * /profile/notifications — настройки push'ей.
 *
 * Содержит:
 *   1. Кнопку «Включить уведомления» (web push subscribe в этом браузере).
 *   2. Тогглы 4 каналов (practice_reminder, streak_risk, daily_goal, achievement).
 *   3. Quiet hours (start/end, 0..23 локального часа).
 *   4. Список зарегистрированных устройств + «Удалить».
 *
 * Источник правды для prefs — `notifications.user_preferences` через
 * gateway. Локальное состояние подмешивается к загруженным prefs только
 * после render'а; сохранение — явной кнопкой «Сохранить».
 */
export default function NotificationsSettingsPage() {
  const { t } = useLanguage();
  const prefs = useNotificationPreferences();
  const devices = useNotificationDevices();
  const updatePrefs = useUpdateNotificationPreferences();
  const push = usePushSubscription();

  const [form, setForm] = useState<UpdatePreferencesRequest | null>(null);

  // Подтягиваем загруженные prefs в форму один раз (при первом fetch'е).
  // setState-in-effect здесь оправдан: данные приезжают асинхронно из
  // useQuery, локальная форма должна инициализироваться один раз.
  useEffect(() => {
    if (!prefs.data || form) return;
    const p = prefs.data.prefs;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      practice_reminder_enabled: p.practice_reminder_enabled,
      streak_risk_enabled: p.streak_risk_enabled,
      daily_goal_enabled: p.daily_goal_enabled,
      achievement_enabled: p.achievement_enabled,
      friend_request_enabled: p.friend_request_enabled,
      quiet_hours_start: p.quiet_hours_start,
      quiet_hours_end: p.quiet_hours_end,
      timezone: p.timezone ?? '',
    });
  }, [prefs.data, form]);

  const isDirty = useMemo(() => {
    if (!form || !prefs.data) return false;
    const p = prefs.data.prefs;
    return (
      form.practice_reminder_enabled !== p.practice_reminder_enabled ||
      form.streak_risk_enabled !== p.streak_risk_enabled ||
      form.daily_goal_enabled !== p.daily_goal_enabled ||
      form.achievement_enabled !== p.achievement_enabled ||
      form.friend_request_enabled !== p.friend_request_enabled ||
      form.quiet_hours_start !== p.quiet_hours_start ||
      form.quiet_hours_end !== p.quiet_hours_end ||
      (form.timezone ?? '') !== (p.timezone ?? '')
    );
  }, [form, prefs.data]);

  const onSave = async () => {
    if (!form) return;
    try {
      await updatePrefs.mutateAsync(form);
      toast.success(t('notifications.page.saveSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.page.saveFail'));
    }
  };

  const onSubscribe = async () => {
    try {
      await push.subscribeAsync();
      toast.success(t('notifications.page.subscribeSuccess'));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('notifications.page.subscribeFail'),
      );
    }
  };

  const onUnsubscribeBrowser = async () => {
    try {
      // device_id неизвестен — браузер отпишется локально, бэк revoke'нёт
      // на следующей неудачной доставке.
      await push.unsubscribeAsync(undefined);
      toast.success(t('notifications.page.unsubscribeSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.page.unsubscribeFail'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Button asChild variant="ghost" className="rounded-xl font-bold w-fit">
        <Link href="/profile">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('notifications.page.backToProfile')}
        </Link>
      </Button>

      <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
        <Bell className="w-7 h-7" />
        {t('notifications.page.title')}
      </h1>

      {/* === Browser subscription === */}
      <PushSupportCard
        ready={push.state.ready}
        support={push.state.support}
        permission={push.state.permission}
        subscribed={push.state.subscribed}
        isSubscribing={push.isSubscribing}
        isUnsubscribing={push.isUnsubscribing}
        error={push.state.error}
        onSubscribe={onSubscribe}
        onUnsubscribe={onUnsubscribeBrowser}
      />

      {/* === Channels === */}
      <Card className="rounded-3xl border-4 p-6 space-y-5">
        <h2 className="font-black text-xl">{t('notifications.channels.title')}</h2>
        {prefs.isLoading || !form ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> {t('notifications.page.loading')}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <ChannelToggle
              label={t('notifications.channels.practiceLabel')}
              hint={t('notifications.channels.practiceHint')}
              checked={form.practice_reminder_enabled}
              onChange={(v) =>
                setForm((f) => f && { ...f, practice_reminder_enabled: v })
              }
            />
            <ChannelToggle
              label={t('notifications.channels.streakLabel')}
              hint={t('notifications.channels.streakHint')}
              checked={form.streak_risk_enabled}
              onChange={(v) => setForm((f) => f && { ...f, streak_risk_enabled: v })}
            />
            <ChannelToggle
              label={t('notifications.channels.dailyGoalLabel')}
              hint={t('notifications.channels.dailyGoalHint')}
              checked={form.daily_goal_enabled}
              onChange={(v) => setForm((f) => f && { ...f, daily_goal_enabled: v })}
            />
            <ChannelToggle
              label={t('notifications.channels.achievementLabel')}
              hint={t('notifications.channels.achievementHint')}
              checked={form.achievement_enabled}
              onChange={(v) => setForm((f) => f && { ...f, achievement_enabled: v })}
            />
            <ChannelToggle
              label={t('notifications.channels.friendRequestLabel')}
              hint={t('notifications.channels.friendRequestHint')}
              checked={form.friend_request_enabled}
              onChange={(v) =>
                setForm((f) => f && { ...f, friend_request_enabled: v })
              }
            />
          </div>
        )}
      </Card>

      {/* === Quiet hours === */}
      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <div>
          <h2 className="font-black text-xl">{t('notifications.quiet.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('notifications.quiet.subtitle')}
          </p>
        </div>
        {prefs.isLoading || !form ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> {t('notifications.page.loading')}
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-4">
            <HourInput
              label={t('notifications.quiet.startLabel')}
              value={form.quiet_hours_start}
              onChange={(v) => setForm((f) => f && { ...f, quiet_hours_start: v })}
            />
            <HourInput
              label={t('notifications.quiet.endLabel')}
              value={form.quiet_hours_end}
              onChange={(v) => setForm((f) => f && { ...f, quiet_hours_end: v })}
            />
          </div>
        )}
      </Card>

      {/* === Save button === */}
      <div className="flex justify-end">
        <Button
          onClick={onSave}
          disabled={!isDirty || updatePrefs.isPending}
          className="rounded-xl font-bold"
        >
          {updatePrefs.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('notifications.page.saving')}
            </>
          ) : (
            t('notifications.page.save')
          )}
        </Button>
      </div>

      {/* === Devices === */}
      <Card className="rounded-3xl border-4 p-6 space-y-4">
        <h2 className="font-black text-xl">{t('notifications.devices.title')}</h2>
        {devices.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> {t('notifications.page.loading')}
          </div>
        ) : (devices.data?.devices ?? []).length === 0 ? (
          <p className="text-muted-foreground">{t('notifications.devices.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {(devices.data?.devices ?? []).map((d) => (
              <DeviceRow key={d.id} device={d} onUnsubscribed={() => push.refresh()} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// === Subcomponents ===

function PushSupportCard(props: {
  ready: boolean;
  support: string;
  permission: NotificationPermission | 'unsupported';
  subscribed: boolean;
  isSubscribing: boolean;
  isUnsubscribing: boolean;
  error: string | null;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}) {
  const { t } = useLanguage();
  if (!props.ready) {
    return (
      <Card className="rounded-3xl border-4 p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> {t('notifications.push.checking')}
        </div>
      </Card>
    );
  }

  if (props.support !== 'supported' && props.support !== 'no_vapid_key') {
    return (
      <Card className="rounded-3xl border-4 p-6 space-y-2">
        <h2 className="font-black text-xl flex items-center gap-2">
          <BellOff className="w-5 h-5" /> {t('notifications.push.unsupportedTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('notifications.push.unsupportedText')}
        </p>
      </Card>
    );
  }

  if (props.support === 'no_vapid_key') {
    return (
      <Card className="rounded-3xl border-4 p-6 space-y-2">
        <h2 className="font-black text-xl flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> {t('notifications.push.noVapidTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('notifications.push.noVapidText')}
        </p>
      </Card>
    );
  }

  if (props.permission === 'denied') {
    return (
      <Card className="rounded-3xl border-4 p-6 space-y-2">
        <h2 className="font-black text-xl flex items-center gap-2">
          <BellOff className="w-5 h-5" /> {t('notifications.push.deniedTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('notifications.push.deniedText')}
        </p>
      </Card>
    );
  }

  if (props.subscribed) {
    return (
      <Card className="rounded-3xl border-4 p-6 space-y-3">
        <h2 className="font-black text-xl flex items-center gap-2">
          <Bell className="w-5 h-5" /> {t('notifications.push.subscribedTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('notifications.push.subscribedText')}
        </p>
        <Button
          variant="outline"
          onClick={props.onUnsubscribe}
          disabled={props.isUnsubscribing}
          className="rounded-xl font-bold"
        >
          {props.isUnsubscribing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('notifications.push.unsubscribing')}
            </>
          ) : (
            t('notifications.push.unsubscribeBtn')
          )}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-4 p-6 space-y-3">
      <h2 className="font-black text-xl flex items-center gap-2">
        <Bell className="w-5 h-5" /> {t('notifications.push.enableTitle')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t('notifications.push.enableText')}
      </p>
      {props.error ? (
        <p className="text-sm text-destructive">{props.error}</p>
      ) : null}
      <Button
        onClick={props.onSubscribe}
        disabled={props.isSubscribing}
        className="rounded-xl font-bold"
      >
        {props.isSubscribing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('notifications.push.subscribing')}
          </>
        ) : (
          t('notifications.push.enableBtn')
        )}
      </Button>
    </Card>
  );
}

function ChannelToggle(props: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer hover:bg-muted/50">
      <Checkbox
        checked={props.checked}
        onCheckedChange={(v) => props.onChange(v === true)}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="font-bold">{props.label}</div>
        <div className="text-xs text-muted-foreground">{props.hint}</div>
      </div>
    </label>
  );
}

function HourInput(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        {props.label}
      </Label>
      <input
        type="number"
        min={0}
        max={23}
        value={props.value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (Number.isFinite(n) && n >= 0 && n <= 23) {
            props.onChange(n);
          }
        }}
        className="w-20 rounded-xl border-2 px-3 py-2 font-bold text-center"
      />
    </div>
  );
}

function DeviceRow(props: { device: DeviceToken; onUnsubscribed: () => void }) {
  const { t } = useLanguage();
  const { device } = props;
  const platform = platformToShort(device.platform) ?? 'unknown';
  const created = tsToDate(device.created_at);
  const lastSeen = tsToDate(device.last_seen_at);

  return (
    <li className="flex items-start justify-between gap-3 p-3 rounded-2xl border-2">
      <div className="flex gap-3">
        <Smartphone className="w-5 h-5 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-bold capitalize flex items-center gap-2">
            {platform}
            {device.revoked_at ? (
              <Badge variant="outline" className="text-xs">{t('notifications.devices.revoked')}</Badge>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">
            {device.user_agent || device.endpoint || device.token.slice(0, 32) + '…'}
          </div>
          <div className="text-xs text-muted-foreground">
            {created ? t('notifications.devices.createdAt').replace('{date}', created.toLocaleDateString()) : null}
            {lastSeen ? t('notifications.devices.lastSeenAt').replace('{date}', lastSeen.toLocaleDateString()) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

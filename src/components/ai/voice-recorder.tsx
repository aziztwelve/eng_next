'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Play, Square, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

/**
 * VoiceRecorder — обёртка над MediaRecorder API:
 *  - Idle: кнопка "Записать" (просит mic permission при первом клике).
 *  - Recording: timer + Stop.
 *  - Recorded: replay + Send + Delete.
 *
 * Reset-снаружи делается через `key`-prop в родителе (стандартный React-приём).
 * Это даёт чистое размонтирование с гарантированной очисткой mediaStream.
 *
 * MAX_DURATION_SEC = 60 — больше не нужно для произношения.
 */
const MAX_DURATION_SEC = 60;

export function VoiceRecorder({
  loading = false,
  onSubmit,
}: {
  /** API-вызов в процессе (lock UI). */
  loading?: boolean;
  /** Родитель решает, что делать с записью. */
  onSubmit: (blob: Blob, durationSec: number) => void | Promise<void>;
}) {
  const { t } = useLanguage();
  const [state, setState] = useState<'idle' | 'recording' | 'recorded' | 'denied'>(
    'idle',
  );
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup на unmount — останавливаем mediaStream и таймер.
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch {
          /* noop */
        }
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // Освобождаем blob URL при смене audioUrl или unmount.
  useEffect(() => {
    if (!audioUrl) return;
    return () => URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const rec = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      recorderRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      rec.onstop = () => {
        const finalType = mimeType || 'audio/webm';
        const b = new Blob(chunksRef.current, { type: finalType });
        const url = URL.createObjectURL(b);
        setBlob(b);
        setAudioUrl(url);
        setState('recorded');
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      rec.start();
      setState('recording');
      setSeconds(0);

      tickRef.current = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (next >= MAX_DURATION_SEC) stop();
          return next;
        });
      }, 1000);
    } catch (e) {
      console.error('mic permission denied', e);
      setState('denied');
    }
  };

  const stop = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  };

  const reset = () => {
    // URL revoke выполняется cleanup'ом useEffect[audioUrl] при смене стейта.
    setBlob(null);
    setAudioUrl(null);
    setSeconds(0);
    setState('idle');
  };

  const submit = async () => {
    if (!blob) return;
    await onSubmit(blob, seconds);
  };

  if (state === 'denied') {
    return (
      <div className="rounded-3xl border-4 p-6 space-y-2 bg-destructive/5 border-destructive/30">
        <p className="font-bold">{t('ai.voiceRecorder.deniedTitle')}</p>
        <p className="text-sm text-muted-foreground font-medium">
          {t('ai.voiceRecorder.deniedHint')}
        </p>
        <Button onClick={() => setState('idle')} variant="outline" className="rounded-xl mt-2">
          {t('ai.voiceRecorder.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-4 p-6 space-y-4">
      {state === 'idle' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Button
            onClick={start}
            className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90 shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all"
            aria-label={t('ai.voiceRecorder.startAria')}
          >
            <Mic className="h-8 w-8" />
          </Button>
          <p className="text-sm text-muted-foreground font-medium">
            {t('ai.voiceRecorder.hint').replace('{n}', String(MAX_DURATION_SEC))}
          </p>
        </div>
      )}

      {state === 'recording' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Button
            onClick={stop}
            className="h-20 w-20 rounded-full bg-destructive hover:bg-destructive/90 shadow-[0_4px_0_0_#a30000] active:translate-y-1 active:shadow-none transition-all animate-pulse"
            aria-label={t('ai.voiceRecorder.stopAria')}
          >
            <Square className="h-8 w-8 fill-current" />
          </Button>
          <div className="text-2xl font-black tabular-nums">
            {formatSeconds(seconds)}
            <span className="text-base text-muted-foreground">
              {' / '}
              {formatSeconds(MAX_DURATION_SEC)}
            </span>
          </div>
        </div>
      )}

      {state === 'recorded' && audioUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <Play className="h-4 w-4 text-muted-foreground" />
            <audio controls src={audioUrl} className="w-full max-w-md" />
          </div>
          <p className="text-xs text-center text-muted-foreground font-medium">
            {t('ai.voiceRecorder.durationLabel').replace('{time}', formatSeconds(seconds))}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={reset}
              variant="outline"
              disabled={loading}
              className="rounded-2xl h-11 font-bold"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('ai.voiceRecorder.rerecord')}
            </Button>
            <Button
              onClick={submit}
              disabled={loading}
              className="rounded-2xl h-11 font-black bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('ai.voiceRecorder.submitting')}
                </>
              ) : (
                t('ai.voiceRecorder.submitBtn')
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function pickMimeType(): string | undefined {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  if (typeof MediaRecorder === 'undefined') return undefined;
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}

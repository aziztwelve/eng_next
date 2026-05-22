'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Loader2, Send, Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

/**
 * ChatInput — textarea + send button с поддержкой "want_audio" toggle и
 * Enter-to-send (Shift+Enter — newline).
 */
export function ChatInput({
  onSend,
  loading = false,
  placeholder,
  showAudioToggle = true,
}: {
  onSend: (content: string, wantAudio: boolean) => void | Promise<void>;
  loading?: boolean;
  placeholder?: string;
  showAudioToggle?: boolean;
}) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [wantAudio, setWantAudio] = useState(false);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setText('');
    await onSend(trimmed, wantAudio);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border-4 bg-card p-3 flex items-end gap-2"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? t('ai.chatInput.placeholder')}
        rows={1}
        disabled={loading}
        className="flex-1 resize-none rounded-2xl bg-background border-2 px-4 py-2 text-base font-medium outline-none focus:border-primary min-h-[44px] max-h-32"
      />

      {showAudioToggle && (
        <Button
          type="button"
          variant={wantAudio ? 'default' : 'outline'}
          size="icon"
          aria-label={wantAudio ? t('ai.chatInput.audioOnAria') : t('ai.chatInput.audioOffAria')}
          onClick={() => setWantAudio((v) => !v)}
          disabled={loading}
          className="h-11 w-11 rounded-2xl shrink-0"
          title={t('ai.chatInput.audioTitle')}
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      )}

      <Button
        type="submit"
        disabled={loading || !text.trim()}
        className="h-11 px-4 rounded-2xl font-black bg-primary hover:bg-primary/90 shrink-0"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="hidden sm:inline ml-1">{t('ai.chatInput.sendBtn')}</span>
      </Button>
    </form>
  );
}

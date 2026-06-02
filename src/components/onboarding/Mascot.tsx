/**
 * Lumi — AI-маскот онбординга v3.
 *
 * 4 позы (idle / cheering / thumbs_up / wink) — SVG-плейсхолдеры из
 * `public/onboarding/lumi-<pose>.svg`. См. `public/onboarding/README.md`
 * для требований к финальным PNG.
 *
 * Используем нативный `<img>` (не `next/image`) — для статических SVG из
 * `public/` оптимизация Next.js не нужна, и это даёт нам один HTTP-запрос
 * без overhead'а image loader'а.
 */

import Image from 'next/image';

export type MascotPose = 'idle' | 'cheering' | 'thumbs_up' | 'wink';

export interface MascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function Mascot({
  pose = 'idle',
  size = 160,
  className,
  priority = false,
}: MascotProps) {
  return (
    <Image
      src={`/onboarding/lumi-${pose}.svg`}
      alt="Lumi"
      width={size}
      height={size}
      priority={priority}
      className={`select-none drop-shadow-md ${className ?? ''}`.trim()}
      // SVG → отключаем optimization (Next 16 любит конвертить, а нам не нужно).
      unoptimized
    />
  );
}

'use client';

import { Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import poster from '@/assets/media/hero-navruz-poster.jpg';
import { cn } from '@/lib/cn';

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * Whether this visitor should get the moving version. The still poster is the default and the
 * fallback: phones, reduced motion, Save-Data and slow connections never download the video.
 */
function canPlayVideo(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.matchMedia('(min-width: 1024px)').matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) return false;
  return true;
}

/**
 * Hero background: a Navruz gathering in Uzbekistan (Lokk1y, CC BY-SA 4.0 — see /credits).
 * The clip plays once, slowed down, then rests on its last frame — which is the poster — so the
 * hero never loops or jumps. It is muted, has no controls of its own and is hidden from assistive
 * technology; a visible pause button meets WCAG 2.2.2 while it moves.
 */
export function HeroMedia() {
  const t = useTranslations('home.hero');
  const video = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<'loading' | 'playing' | 'paused' | 'done'>('loading');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- device capabilities are only known after hydration
    setEnabled(canPlayVideo());
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  return (
    // Below lg the photo is a band above the text; from lg it sits behind the text under a wash.
    <div
      className="absolute inset-x-0 top-0 h-56 overflow-hidden sm:h-72 lg:inset-y-0 lg:right-0 lg:left-[45%] lg:h-auto xl:left-[38%]"
      data-testid="hero-media"
      data-video={enabled ? 'on' : 'off'}
    >
      <Image
        src={poster}
        alt=""
        fill
        preload
        sizes="100vw"
        className="object-cover object-[center_40%] lg:object-center"
        data-testid="hero-poster"
      />
      {enabled && (
        <video
          ref={video}
          className={cn(
            'absolute inset-0 size-full object-cover object-center transition-opacity duration-500',
            state === 'loading' ? 'opacity-0' : 'opacity-100',
          )}
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={() => setState('playing')}
          onPause={() => setState((s) => (s === 'done' ? s : 'paused'))}
          onEnded={() => setState('done')}
          onError={() => setEnabled(false)}
          data-testid="hero-video"
        >
          <source src="/media/hero-navruz.webm" type="video/webm" />
          <source src="/media/hero-navruz.mp4" type="video/mp4" />
        </video>
      )}
      {/* Readability first. On desktop the media starts behind the end of the text column; the wash
          stays at ≥94% cream wherever text can reach (worst case, ink-2 over a black pixel still meets
          4.5:1), then opens up towards the right edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-[linear-gradient(90deg,var(--color-canvas)_0%,color-mix(in_srgb,var(--color-canvas)_94%,transparent)_30%,color-mix(in_srgb,var(--color-canvas)_55%,transparent)_56%,color-mix(in_srgb,var(--color-canvas)_32%,transparent)_100%)] lg:block"
      />
      {/* Fades into the page: the bottom of the band on phones, the bottom of the hero on desktop. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-canvas lg:h-40" />
      {enabled && (state === 'playing' || state === 'paused') && (
        <button
          type="button"
          onClick={toggle}
          className="absolute right-4 bottom-12 z-10 inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-sm)] border border-line bg-surface/90 px-3 text-[13px] font-medium text-ink-2 hover:text-ink sm:right-8"
          data-testid="hero-video-toggle"
        >
          {state === 'playing' ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          {state === 'playing' ? t('pauseVideo') : t('playVideo')}
        </button>
      )}
    </div>
  );
}

'use client';

import { motion } from 'motion/react';
import Image, { type StaticImageData } from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { EASE_OUT } from '@/lib/motion';
import { creditFor, type MediaKey } from './media-credits';

/**
 * A single photograph that supports the story around it. It fades in gently (450ms, once) as it
 * scrolls into view, and carries its own attribution.
 */
export function StoryPhoto({ src, media, className }: { src: StaticImageData; media: Exclude<MediaKey, 'navruz'>; className?: string }) {
  const t = useTranslations('media');
  const credit = creditFor(media);
  return (
    <motion.figure
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className={cn('min-w-0', className)}
      data-testid={`photo-${media}`}
    >
      <div className="overflow-hidden rounded-[var(--radius-lg)] bg-sunken">
        <Image
          src={src}
          alt={t(`${media}.alt`)}
          placeholder="blur"
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3] w-full object-cover object-[50%_30%] sm:aspect-[4/5]"
        />
      </div>
      <figcaption className="mt-2 text-[13px] leading-snug text-ink-2">
        {t(`${media}.caption`)}{' '}
        <a href={credit.sourceUrl} rel="noreferrer noopener" target="_blank" className="underline underline-offset-2 hover:text-ink">
          {t('photoBy', { author: credit.author })}
        </a>
        , {credit.license}
      </figcaption>
    </motion.figure>
  );
}

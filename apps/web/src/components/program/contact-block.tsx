import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { sourceHost } from '@/lib/review-status';

/** Contact details — only the ones collected from a source, never invented or shown as dead links. */
export async function ContactBlock({
  website,
  phone,
  email,
  address,
}: {
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}) {
  const t = await getTranslations('contact');
  const host = sourceHost(website);
  const rows = [
    website && host ? { icon: Globe, label: t('website'), value: host, href: website, external: true } : null,
    phone ? { icon: Phone, label: t('phone'), value: phone, href: `tel:${phone.replace(/[^\d+]/g, '')}` } : null,
    email ? { icon: Mail, label: t('email'), value: email, href: `mailto:${email}` } : null,
    address ? { icon: MapPin, label: t('address'), value: address, href: null } : null,
  ].filter((row) => row !== null);

  return (
    <section aria-labelledby="contact-title" id="contact" data-testid="contact-block">
      <h2 id="contact-title" className="kicker mb-3">
        {t('title')}
      </h2>
      {rows.length === 0 ? (
        <p className="meta" data-testid="contact-missing">
          {t('noneCollected')}
        </p>
      ) : (
        <dl className="space-y-3 text-[15px]">
          {rows.map(({ icon: Icon, label, value, href, external }) => (
            <div key={label} className="min-w-0">
              <dt className="label flex items-center gap-1.5">
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </dt>
              <dd className="break-words">
                {href ? (
                  <a
                    className="action min-h-11 break-all"
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-ink">{value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="meta mt-3 text-[14px]">{t('confirm')}</p>
    </section>
  );
}

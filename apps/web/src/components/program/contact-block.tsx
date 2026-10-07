import { getTranslations } from 'next-intl/server';

/** Contact details — shown only when collected, never invented. */
export async function ContactBlock({ website, phone, email }: { website: string | null; phone: string | null; email: string | null }) {
  const t = await getTranslations('contact');
  const rows = [
    { label: t('website'), value: website, href: website },
    { label: t('phone'), value: phone, href: phone ? `tel:${phone}` : null },
    { label: t('email'), value: email, href: email ? `mailto:${email}` : null },
  ];
  return (
    <section aria-labelledby="contact-title">
      <h2 id="contact-title" className="kicker mb-3">{t('title')}</h2>
      <dl className="space-y-3 text-[15px]">
        {rows.map(({ label, value, href }) => (
          <div key={label}>
            <dt className="label">{label}</dt>
            <dd>{value && href ? <a className="action min-h-0" href={href}>{value}</a> : <span className="text-ink-3">{t('notCollectedShort')}</span>}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function ReportButton() {
  const t = useTranslations('trust');
  const [clicked, setClicked] = useState(false);
  return clicked ? (
    <p role="status" className="meta mt-3 text-success">{t('reportPrototype')}</p>
  ) : (
    <button type="button" className="action-quiet mt-1" onClick={() => setClicked(true)}>
      {t('report')}
    </button>
  );
}

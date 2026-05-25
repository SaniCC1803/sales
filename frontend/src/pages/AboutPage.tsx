import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';
import { apiFetch } from '@/lib/apiFetch';
import type { Application } from '@/types/application';

export default function AboutPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await apiFetch<Application>('/applications/current');
      setApplication(data);
    })();
  }, []);

  const aboutUs =
    application?.translations.find((tr) => tr.language === language)?.aboutUs ||
    application?.translations[0]?.aboutUs ||
    '';

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">{t('aboutUs')}</h1>
      <p className="whitespace-pre-wrap text-base leading-relaxed">{aboutUs}</p>
    </div>
  );
}

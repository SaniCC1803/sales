import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Edit3, Plus } from 'lucide-react';
import type { Application } from '@/types/application';

type ApplicationCardProps = {
  application: Application | null;
  onEdit?: () => void;
  onCreate?: () => void;
  onCarouselImageClick?: (images: string[], index: number) => void;
};

export default function ApplicationCardComponent({
  application,
  onEdit,
  onCreate,
  onCarouselImageClick,
}: ApplicationCardProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'mk';

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `http://localhost:3000${path}`;
  };

  if (!application) {
    return (
      <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl font-bold text-foreground mb-2">
          {t('noApplication')}
        </CardTitle>
        <CardDescription className="text-muted-foreground mb-6">
          Create your first application to get started
        </CardDescription>
        <Button onClick={onCreate} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          {t('createApplication')}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-8 shadow-sm">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold text-foreground">{t('applicationInformation')}</h2>
          <Button onClick={onEdit} variant="outline" size="lg">
            <Edit3 className="h-4 w-4 mr-2" />
            {t('edit')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {application.logo && (
            <div className="lg:col-span-1">
              <label className="text-sm font-bold text-primary mb-3 block uppercase tracking-wide">
                {t('logo')}
              </label>
              <div className="bg-muted/30 border border-border rounded-lg p-6 flex items-center justify-center">
                <img
                  src={getImageUrl(application.logo)}
                  alt="Application Logo"
                  className="max-w-full max-h-48 object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          <div className={`${application.logo ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            <div>
              <label className="text-sm font-bold text-primary mb-3 block uppercase tracking-wide">
                {t('name')}
              </label>
              <p className="text-2xl font-bold text-foreground">
                {application.translations.find((t) => t.language === currentLanguage)?.name ||
                  application.translations.find((t) => t.language === 'en')?.name ||
                  application.translations[0]?.name ||
                  'Unnamed Application'}
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-primary mb-3 block uppercase tracking-wide">
                {t('description')}
              </label>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                {application.translations.find((t) => t.language === currentLanguage)
                  ?.description ||
                  application.translations.find((t) => t.language === 'en')?.description ||
                  application.translations[0]?.description ||
                  'No description provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Carousel Images Section */}
        {application.carousel && application.carousel.length > 0 && (
          <div className="mt-8">
            <label className="text-sm font-bold text-primary mb-3 block uppercase tracking-wide">
              {t('carouselImages')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {application.carousel.map((img, idx) => (
                <div
                  key={idx}
                  className="bg-muted/30 border border-border rounded-lg p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    application.carousel && onCarouselImageClick?.(application.carousel, idx)
                  }
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Carousel ${idx + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">Image {idx + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

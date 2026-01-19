'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import SingleImageUpload from '@/components/SingleImageUpload';
import MultiImageDropzone from '@/components/MultiImageDropzone';
import type { Application } from '@/types/application';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

// ================== TYPES ==================

type Language = 'en' | 'mk';

// Move languages array outside component to avoid recreation on every render
const LANGUAGES: Language[] = ['en', 'mk'];

export type ApplicationFormValues = {
  translations: {
    language: Language;
    name: string;
    description?: string;
  }[];
  logo: File | null;
  carousel: (string | File)[]; // URLs or Files;
};

interface ApplicationFormProps {
  editApplication?: Application | null;
  onCreated?: () => void;
  onEditComplete?: () => void;
  closeDrawer: () => void;
}

// ================== COMPONENT ==================

export default function ApplicationForm({
  editApplication,
  onCreated,
  onEditComplete,
  closeDrawer,
}: ApplicationFormProps) {
  const { t } = useTranslation();
  const isEditMode = !!editApplication;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------ FORM ------------------

  const { control, handleSubmit, reset } = useForm<ApplicationFormValues>({
    defaultValues: getDefaultValues(editApplication),
  });

  // ------------------ EFFECTS ------------------

  useEffect(() => {
    if (editApplication) {
      reset(getDefaultValues(editApplication));
    }
  }, [editApplication, reset]);

  // ------------------ SUBMIT ------------------

  const onSubmit = async (data: ApplicationFormValues) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('translations', JSON.stringify(data.translations));

      // Handle carousel images (both URLs and files)
      const existingUrls = data.carousel.filter((i): i is string => typeof i === 'string');
      const newFiles = data.carousel.filter((i): i is File => i instanceof File);

      formData.append('carousel', JSON.stringify(existingUrls));
      newFiles.forEach((file) => formData.append('carousel', file));

      if (data.logo) {
        formData.append('logo', data.logo);
      }

      let res: Response;

      if (isEditMode && editApplication) {
        res = await fetchWithAuth(`http://localhost:3000/applications/${editApplication.id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        res = await fetchWithAuth('http://localhost:3000/applications', {
          method: 'POST',
          body: formData,
        });
      }

      if (!res.ok) {
        console.error('Failed to save application');
        return;
      }

      if (isEditMode) {
        onEditComplete?.();
      } else {
        onCreated?.();
      }

      closeDrawer();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================== RENDER ==================

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-1">
      {/* ---------- NAME ---------- */}
      <Label>{t('name')}</Label>
      {LANGUAGES.map((lang, idx) => (
        <Controller
          key={lang}
          name={`translations.${idx}.name` as const}
          control={control}
          rules={{ required: t('nameRequired') as string }}
          render={({ field }) => <Input {...field} placeholder={lang.toUpperCase()} />}
        />
      ))}

      <Separator />

      {/* ---------- DESCRIPTION ---------- */}
      <Label>{t('description')}</Label>
      {LANGUAGES.map((lang, idx) => (
        <Controller
          key={lang}
          name={`translations.${idx}.description` as const}
          control={control}
          render={({ field }) => <Input {...field} placeholder={lang.toUpperCase()} />}
        />
      ))}

      <Separator />

      {/* ---------- LOGO ---------- */}
      <Label>{t('logo')}</Label>
      <Controller
        name="logo"
        control={control}
        render={({ field }) => (
          <SingleImageUpload
            value={field.value}
            existingImageUrl={editApplication?.logo}
            onChange={field.onChange}
          />
        )}
      />

      <Separator />

      {/* ---------- CAROUSEL ---------- */}
      <Label>{t('carouselImages')}</Label>
      <Controller
        name="carousel"
        control={control}
        render={({ field }) => {
          const existingUrls = (field.value || []).filter((i) => typeof i === 'string');
          const newFiles = (field.value || []).filter((i) => i instanceof File);

          return (
            <div className="flex flex-col gap-2">
              {existingUrls.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {existingUrls.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={url.startsWith('http') ? url : `http://localhost:3000${url}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => {
                          const filtered = field.value.filter((v) => v !== url);
                          field.onChange(filtered);
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <MultiImageDropzone
                value={newFiles}
                onChange={(files) => field.onChange([...existingUrls, ...files])}
              />
            </div>
          );
        }}
      />

      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isEditMode ? t('save') : t('create')}
        </Button>
      </div>
    </form>
  );
}

// ================== HELPERS ==================

function getDefaultValues(editApplication: Application | null | undefined): ApplicationFormValues {
  if (editApplication) {
    return {
      translations: LANGUAGES.map((lang) => {
        const existing = editApplication.translations.find((t) => t.language === lang);
        return {
          language: lang,
          name: existing?.name || '',
          description: existing?.description || '',
        };
      }),
      logo: null,
      carousel: Array.isArray(editApplication.carousel) ? editApplication.carousel : [],
    };
  }

  return {
    translations: LANGUAGES.map((lang) => ({
      language: lang,
      name: '',
      description: '',
    })),
    logo: null,
    carousel: [],
  };
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Select as NativeSelect } from '@/components/ui/select-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getDefaultCategoryValues } from './utils';

import SingleImageUpload from '@/components/SingleImageUpload';
import type { Category } from '@/types/category';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { ErrorMessage } from '@hookform/error-message';

type Language = 'en' | 'mk';

export type CategoryFormValues = {
  translations: {
    language: Language;
    name: string;
    description?: string;
  }[];
  parentId: number | null;
  image: File | null;
};

interface CategoryFormProps {
  editCategory?: Category | null;
  onCreated?: () => void;
  onEditComplete?: () => void;
  closeDrawer: () => void;
}

export default function CategoryForm({
  editCategory,
  onCreated,
  onEditComplete,
  closeDrawer,
}: CategoryFormProps) {
  const { t } = useTranslation();
  const languages = useMemo<Language[]>(() => ['en', 'mk'], []);
  const isEditMode = !!editCategory;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: getDefaultCategoryValues(editCategory, languages),
  });

  useEffect(() => {
    fetch('http://localhost:3000/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (editCategory) {
      reset(getDefaultCategoryValues(editCategory, languages));
    }
  }, [editCategory, languages, reset]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('translations', JSON.stringify(data.translations));
      if (data.parentId !== null) {
        formData.append('parentId', data.parentId.toString());
      }

      if (data.image) {
        formData.append('image', data.image);
      }

      let res: Response;

      if (isEditMode && editCategory) {
        res = await fetchWithAuth(`http://localhost:3000/categories/${editCategory.id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        res = await fetchWithAuth('http://localhost:3000/categories', {
          method: 'POST',
          body: formData,
        });
      }

      if (!res.ok) {
        console.error('Failed to save category');
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
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-1">
      {/* Name */}
      <Label>{t('name')}</Label>
      {languages.map((lang, idx) => (
        <Controller
          key={lang}
          name={`translations.${idx}.name` as const}
          control={control}
          rules={{
            required: t('nameRequired'),
          }}
          render={({ field }) => (
            <div className="flex flex-col gap-0.5">
              <Input {...field} placeholder={lang.toUpperCase()} />
              <ErrorMessage
                errors={errors}
                name={`translations.${idx}.name`}
                render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
              />
            </div>
          )}
        />
      ))}

      <Separator />

      {/* Description */}
      <Label>{t('description')}</Label>
      {languages.map((lang, idx) => (
        <Controller
          key={lang}
          name={`translations.${idx}.description` as const}
          control={control}
          render={({ field }) => <Input {...field} placeholder={lang.toUpperCase()} />}
        />
      ))}

      <Separator />

      {/* Category */}
      <Label>{t('category')}</Label>
      <Controller
        name="parentId"
        control={control}
        render={({ field }) => (
          <NativeSelect
            {...field}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
          >
            <option value="">{t('selectCategory')}</option>
            {categories
              .filter((cat) => !editCategory || cat.id !== editCategory.id)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.translations.find((t) => t.language === 'en')?.name ||
                    cat.translations[0]?.name}
                </option>
              ))}
          </NativeSelect>
        )}
      />

      <Separator />

      {/* Image */}
      <Label>{t('image')}</Label>
      <Controller
        name="image"
        control={control}
        rules={!isEditMode ? { required: t('imageRequired') } : {}}
        render={({ field }) => (
          <div className="flex flex-col gap-0.5">
            <SingleImageUpload
              value={field.value}
              existingImageUrl={editCategory?.image}
              onChange={field.onChange}
            />
            <ErrorMessage
              errors={errors}
              name="image"
              render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
            />
          </div>
        )}
      />

      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isEditMode ? t('save') : t('create')}
        </Button>
      </div>
    </form>
  );
}

'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select as NativeSelect } from '@/components/ui/select-native';
import { getDefaultProductValues } from './utils';

import MultiImageDropzone from '@/components/MultiImageDropzone';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { ErrorMessage } from '@hookform/error-message';

type Language = 'en' | 'mk';

export type ProductFormValues = {
  translations: {
    language: Language;
    name: string;
    description?: string;
  }[];
  price: string;
  categoryId?: number | null;
  images: (string | File)[];
};

interface ProductFormProps {
  editProduct?: Product | null;
  onCreated?: () => void;
  onEditComplete?: () => void;
  closeDrawer: () => void;
}

export default function ProductForm({
  editProduct,
  onCreated,
  onEditComplete,
  closeDrawer,
}: ProductFormProps) {
  const { t } = useTranslation();
  const languages = useMemo<Language[]>(() => ['en', 'mk'], []);
  const isEditMode = !!editProduct;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: getDefaultProductValues(editProduct, languages),
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (editProduct) {
      reset(getDefaultProductValues(editProduct, languages));
    }
  }, [editProduct, languages, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('translations', JSON.stringify(data.translations));
      formData.append('price', data.price.toString());
      if (data.categoryId && data.categoryId > 0) {
        formData.append('categoryId', data.categoryId.toString());
      }

      const existingUrls = data.images.filter((i): i is string => typeof i === 'string');
      const newFiles = data.images.filter((i): i is File => i instanceof File);

      formData.append('images', JSON.stringify(existingUrls));
      newFiles.forEach((file) => formData.append('images', file));

      let res: Response;

      if (isEditMode && editProduct) {
        res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/products/${editProduct.id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/products`, {
          method: 'POST',
          body: formData,
        });
      }

      if (!res.ok) {
        console.error('Failed to save product');
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-1">
      {/* Name */}
      <Label>{t('name')}</Label>
      {languages.map((lang, idx) => (
        <Controller
          key={lang}
          name={`translations.${idx}.name` as const}
          control={control}
          rules={{ required: t('nameRequired') as string }}
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

      {/* Price */}
      <Label>{t('price')}</Label>
      <Controller
        name="price"
        control={control}
        rules={{
          required: t('priceRequired') as string,
          pattern: {
            value: /^\d+(\.\d{1,2})?$/,
            message: (t('priceInvalid') as string) || 'Please enter a valid price (numbers only)',
          },
          validate: (v) => parseFloat(v) > 0 || (t('priceMinimum') as string),
        }}
        render={({ field }) => (
          <div className="flex flex-col gap-0.5">
            <Input
              {...field}
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder={t('price')}
              onChange={(e) => {
                // Allow only numbers and decimal point
                const value = e.target.value.replace(/[^0-9.]/g, '');
                field.onChange(value);
              }}
            />
            <ErrorMessage
              errors={errors}
              name={`price`}
              render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
            />
          </div>
        )}
      />

      <Separator />

      {/* Category */}
      <Label>{t('category')}</Label>
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-0.5">
            <NativeSelect
              {...field}
              value={field.value && field.value > 0 ? field.value.toString() : ''}
              onChange={(e) =>
                field.onChange(e.target.value === '' ? null : Number(e.target.value))
              }
            >
              <option value="">{t('selectCategory')}</option>
              {categories
                .filter((cat) => !editProduct || cat.id !== editProduct.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.translations.find((t) => t.language === 'en')?.name ||
                      cat.translations[0]?.name}
                  </option>
                ))}
            </NativeSelect>
            <ErrorMessage
              errors={errors}
              name={`categoryId`}
              render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
            />
          </div>
        )}
      />
      <Separator />

      {/* Images */}
      <Label>{t('images')}</Label>
      <Controller
        name="images"
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
                        src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`}
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

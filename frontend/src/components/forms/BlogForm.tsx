import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select-native';
import { Separator } from '@/components/ui/separator';
import { ErrorMessage } from '@hookform/error-message';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import type { Blog } from '@/types/blog';
import SingleImageUpload from '@/components/SingleImageUpload';
import { getDefaultBlogValues } from './utils';
import type { Language } from '@/types/application';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface BlogFormProps {
  editBlog?: Blog | null;
  onCreated?: () => void;
  onEditComplete?: () => void;
  closeDrawer: () => void;
  formId: string;
}

interface BlogFormTranslation {
  language: Language;
  title: string;
  content: string;
  excerpt: string;
}

interface BlogFormData {
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  featuredImage?: File;
  translations: BlogFormTranslation[];
}

export default function BlogForm({
  editBlog,
  onCreated,
  onEditComplete,
  closeDrawer,
  formId,
}: BlogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const languages = useMemo<Language[]>(() => ['en', 'mk'], []);
  const { t } = useTranslation();
  const isEditMode = !!editBlog;
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [currentFeaturedImage, setCurrentFeaturedImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogFormData>({
    defaultValues: getDefaultBlogValues(editBlog, languages),
  });
  const watchedEnTitle = watch('translations.0.title');

  useEffect(() => {
    if (editBlog) {
      reset(getDefaultBlogValues(editBlog));
      setCurrentFeaturedImage(editBlog.featuredImage || null);
    } else {
      reset(getDefaultBlogValues());
      setCurrentFeaturedImage(null);
    }
    setFeaturedImageFile(null);
  }, [editBlog, reset]);

  useEffect(() => {
    if (!editBlog && watchedEnTitle) {
      const newSlug = generateSlug(watchedEnTitle);
      setValue('slug', newSlug);
    }
  }, [watchedEnTitle, editBlog, setValue]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('slug', data.slug);
      formData.append('status', data.status);
      if (featuredImageFile) {
        formData.append('featuredImage', featuredImageFile);
      }
      // Always send translations as array of objects
      formData.append('translations', JSON.stringify(data.translations));
      let res: Response;
      if (editBlog) {
        res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/blogs/${editBlog.id}`, {
          method: 'PATCH',
          body: formData,
        });
      } else {
        res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/blogs`, {
          method: 'POST',
          body: formData,
        });
      }
      if (!res.ok) {
        setIsSubmitting(false);
        return;
      }
      if (editBlog) {
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
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-1">
      {/* Slug */}
      <Label>{t('slug')}</Label>
      <Controller
        name="slug"
        control={control}
        rules={{ required: t('slugRequired') }}
        render={({ field }) => (
          <div className="flex flex-col gap-0.5">
            <Input {...field} placeholder="blog-post-slug" />
            <ErrorMessage
              errors={errors}
              name="slug"
              render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
            />
          </div>
        )}
      />

      <Separator />

      {/* Status */}
      <Label>{t('status')}</Label>
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select {...field}>
            <option value="DRAFT">{t('draft')}</option>
            <option value="PUBLISHED">{t('published')}</option>
          </Select>
        )}
      />

      <Separator />

      {/* Featured Image */}
      <Label>{t('featuredImage')}</Label>
      <SingleImageUpload
        value={featuredImageFile}
        existingImageUrl={currentFeaturedImage || undefined}
        onChange={setFeaturedImageFile}
      />

      <Separator />

      {/* Title */}
      <Label>{t('title')}</Label>
      {languages.map((lang, idx) => (
        <Controller
          key={lang}
          name={`translations.${idx}.title` as const}
          control={control}
          rules={{ required: t('titleRequired') }}
          render={({ field }) => (
            <div className="flex flex-col gap-0.5">
              <Input {...field} placeholder={lang.toUpperCase()} />
              <ErrorMessage
                errors={errors}
                name={`translations.${idx}.title`}
                render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
              />
            </div>
          )}
        />
      ))}

      <Separator />

      {/* Excerpt */}
      <Label>{t('excerpt')}</Label>
      {languages.map((lang, idx) => (
        <Controller
          key={lang}
          name={`translations.${idx}.excerpt` as const}
          control={control}
          rules={{ required: t('excerptRequired') }}
          render={({ field }) => (
            <div className="flex flex-col gap-0.5">
              <Input {...field} placeholder={lang.toUpperCase()} />
              <ErrorMessage
                errors={errors}
                name={`translations.${idx}.excerpt`}
                render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
              />
            </div>
          )}
        />
      ))}

      <Separator />

      {/* Content */}
      <Label>{t('content')}</Label>
      {languages.map((lang, idx) => (
        <Controller
          key={lang}
          name={`translations.${idx}.content` as const}
          control={control}
          rules={{ required: t('contentRequired') }}
          render={({ field }) => (
            <div className="flex flex-col gap-0.5">
              <Textarea {...field} placeholder={lang.toUpperCase()} rows={8} />
              <ErrorMessage
                errors={errors}
                name={`translations.${idx}.content`}
                render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
              />
            </div>
          )}
        />
      ))}
      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isEditMode ? t('save') : t('create')}
        </Button>
      </div>
    </form>
  );
}

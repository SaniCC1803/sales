import React, { useEffect, useState } from "react";
import { apiFetch } from '@/lib/apiFetch';
import { Link, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';
import type { Category } from "../types/category";
import type { Product } from "../types/product";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import CardComponent from '@/components/Card';
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryResponse {
  category: Category;
  subcategories: Category[];
  products: Product[];
}

const CategoryViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data, error } = await apiFetch<CategoryResponse>(`/categories/${id}`);
      if (error) {
        setError(error);
        setData(null);
      } else {
        setData(data);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-8 w-80" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 text-destructive text-center">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const categoryTranslation = data.category.translations.find(tr => tr.language === language) || data.category.translations[0];
  const categoryName = categoryTranslation?.name ?? t('unnamed', 'Unnamed');

  return (
    <div className="container mx-auto px-6 py-12 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">{t('home', 'Home')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{categoryName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold">{categoryName}</h1>

      {/* Subcategories */}
      {data.subcategories.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-center sm:text-left">
            {t('subcategories', 'Subcategories')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.subcategories.map((sub) => (
              <CardComponent key={sub.id} item={sub} />
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      {data.products.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-center sm:text-left">
            {t('products', 'Products')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.products.map((prod) => (
              <CardComponent key={prod.id} item={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {data.subcategories.length === 0 && data.products.length === 0 && (
        <div className="text-muted-foreground text-center">
          {t('noSubcategoriesOrProducts', 'No subcategories or products found in this category.')}
        </div>
      )}
    </div>
  );
};

export default CategoryViewPage;

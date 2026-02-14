import React, { useEffect, useState } from "react";
import { getImageUrl } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';
import { useParams, Link } from "react-router-dom";
import type { Product } from "../types/product";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import ImageGallery from "@/components/ImageGallery";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const { t } = useTranslation();
  const { language } = useLanguage();

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data, error } = await apiFetch<Product>(`/products/${id}`);
      if (error) {
        setError(error);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    })();
  }, [id]);

    // Increment product views on mount
    useEffect(() => {
      if (!id) return;
      apiFetch(`/products/${id}/view`, { method: 'POST' });
    }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Skeleton className="h-6 w-64 mb-4" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 text-destructive">
        {error}
      </div>
    );
  }

  if (!product) return null;

  const openGallery = (index: number) => {
    setGalleryStartIndex(index);
    setGalleryOpen(true);
  };

  const productTranslation = product.translations.find(t => t.language === language) || product.translations[0];
  const productName = productTranslation?.name ?? "Product";
  const productDescription = productTranslation?.description ?? "";

  return (
    <div className="container mx-auto px-6 py-12 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">{t('home', 'Home')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {product.category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/category/${product.category.id}`}>
                    {product.category.translations[0]?.name ?? t('category', 'Category')}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{productName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Product */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">{productName}</h1>

          {/* Images */}
          <div className="flex gap-4 overflow-x-auto">
            {product.images?.length ? (
              product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(img)}
                  alt={productName}
                  className="h-52 w-52 rounded-lg border object-cover cursor-pointer hover:opacity-80 transition"
                  onClick={() => openGallery(idx)}
                />
              ))
            ) : (
              <p className="text-muted-foreground">{t('noImages', 'No images')}</p>
            )}
          </div>

          <div className="text-lg font-semibold">
            {t('price', 'Price')}: {product.price} {t("den")}
          </div>

          <p className="text-muted-foreground">
            {productDescription}
          </p>

          <div className="text-xs text-muted-foreground">
            {t('productId', 'Product ID')}: {product.id}
          </div>
        </CardContent>
      </Card>

      {/* Gallery dialog */}
      <ImageGallery
        images={product.images ?? []}
        isOpen={galleryOpen}
        initialIndex={galleryStartIndex}
        onClose={() => setGalleryOpen(false)}
        title={productName}
      />
    </div>
  );
};

export default ProductDetailPage;

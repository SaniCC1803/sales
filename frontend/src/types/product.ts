import type { Category } from '@/types/category';

export interface ProductTranslation {
  id: number;
  language: string;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  images: string[];
  price: number;
  categoryId?: number;
  category?: Category;
  translations: ProductTranslation[];
  createdAt: string;
  views?: number;
  promoted?: boolean;
}

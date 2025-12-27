import type { Language } from '@/types/application';
import type { Product } from '@/types/product';

export interface CategoryTranslation {
  language: Language;
  name: string;
  description: string;
}

export interface Category {
  id: number;
  parentId?: number | null;
  parent?: Category | null;
  subcategories?: Category[];
  image: string;
  products?: Product[];
  translations: CategoryTranslation[];
}

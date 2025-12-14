import type { Category } from '@/types/category';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
  category?: Category;
  createdAt: string;
}

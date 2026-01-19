export interface BlogTranslation {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  language: 'en' | 'mk';
}

export interface Blog {
  id: number;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    email: string;
    role: string;
  };
  translations: BlogTranslation[];
}

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { useTranslation } from 'react-i18next';
import type { Blog } from '@/types/blog';
import CardComponent from '@/components/Card';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await apiFetch<Blog[]>('/blogs?published=true');
        if (error) {
          setError(error);
          setBlogs([]);
        } else {
          setBlogs(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <span>{t('loadingBlogs', 'Loading blogs...')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p>
            {t('error')}: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('blogs')}</h1>

      {blogs.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground">{t('noBlogsFound', 'No blogs found.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <CardComponent key={blog.id} item={blog} />
          ))}
        </div>
      )}
    </div>
  );
}

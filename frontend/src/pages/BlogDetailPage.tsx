import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { t } from 'i18next';
import type { Blog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BlogDetailPage() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) {
        setError('No blog slug provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/blogs/slug/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog');
        }
        const data = await response.json();
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const getBlogTranslation = (blog: Blog) => {
    return blog.translations.find((t) => t.language === language) || blog.translations[0];
  };

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:3000${path}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <span>Loading blog...</span>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p>Error: {error || 'Blog not found'}</p>
          <Link to="/blogs">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const translation = getBlogTranslation(blog);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/blogs">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>
      </Link>

      <article>
        {blog.featuredImage && (
          <img
            src={getImageUrl(blog.featuredImage)}
            alt={translation.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
          />
        )}

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{translation.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>By {blog.author ? blog.author.email : t('unknownAuthor')}</span>
            <span>•</span>
            <span>{new Date(blog.publishedAt!).toLocaleDateString()}</span>
            <span>•</span>
            <span>Last updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
          </div>
        </header>

        {translation.excerpt && (
          <div className="text-lg text-muted-foreground mb-8 p-4 bg-muted rounded-lg">
            <em>{translation.excerpt}</em>
          </div>
        )}

        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: translation.content }}
        />
      </article>
    </div>
  );
}

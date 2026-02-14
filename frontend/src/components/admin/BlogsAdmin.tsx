import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import type { Blog } from '@/types/blog';
import { useLanguage } from '@/context/LanguageContext';
import CardComponent from '@/components/Card';
import CreateEditDrawer from '@/components/forms/CreateEditDrawer';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import type { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from './pageParts/PageHeader';
import { useTranslation } from 'react-i18next';
import { CardsWrapper } from './pageParts/CardsWrapper';

export default function BlogsAdmin() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number;
    title: string;
  }>({
    open: false,
    id: 0,
    title: '',
  });
  const { language } = useLanguage();

  const fetchBlogs = () => {
    fetchWithAuth(`${import.meta.env.VITE_API_URL}/blogs`)
      .then((res) => res.json())
      .then(setBlogs)
      .catch(() => setError('Failed to load blogs'));
  };

  const getBlogTranslation = (blog: Blog) => {
    return blog.translations.find((t) => t.language === language) || blog.translations[0];
  };

  const handleDeleteBlog = (id: number) => {
    const blog = blogs.find((b) => b.id === id);
    const translation = blog ? getBlogTranslation(blog) : null;
    const blogTitle = translation?.title || 'Unknown Blog';

    setDeleteModal({
      open: true,
      id,
      title: blogTitle,
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/blogs/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchBlogs();
        setDeleteModal({ ...deleteModal, open: false });
      } else {
        setError('Failed to delete blog');
      }
    } catch {
      setError('Failed to delete blog');
    }
  };

  const handleEdit = (item: Blog | Category | Product | User) => {
    setCreateDrawerOpen(false);
    if ('slug' in item && 'author' in item) {
      setEditingBlog(item as Blog);
    }
  };

  const handleEditComplete = () => {
    setEditingBlog(null);
    fetchBlogs();
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return (
    <>
      <PageHeader
        title={t('blogs')}
        onAdd={() => {
          setEditingBlog(null);
          setCreateDrawerOpen(true);
        }}
      />

      <CardsWrapper>
        {blogs.map((blog) => (
          <CardComponent
            key={blog.id}
            item={blog}
            onDelete={handleDeleteBlog}
            onEdit={handleEdit}
          />
        ))}
      </CardsWrapper>

      <CreateEditDrawer
        onBlogCreated={fetchBlogs}
        editBlog={editingBlog}
        onBlogEditComplete={handleEditComplete}
        activeSection="blogs"
        open={Boolean(editingBlog || createDrawerOpen)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBlog(null);
            setCreateDrawerOpen(false);
          }
        }}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={confirmDelete}
        title={t('deleteBlog')}
        itemName={deleteModal.title}
      />
    </>
  );
}

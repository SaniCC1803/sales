import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import CardComponent from '@/components/Card';
import CreateEditDrawer from '@/components/forms/CreateEditDrawer';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import type { User } from '@/types/user';
import type { Blog } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { PageHeader } from './pageParts/PageHeader';
import { CardsWrapper } from './pageParts/CardsWrapper';

export default function CategoriesAdmin() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number;
    name: string;
  }>({
    open: false,
    id: 0,
    name: '',
  });

  const fetchCategories = () => {
    fetchWithAuth('http://localhost:3000/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setError('Failed to load categories'));
  };

  const handleDeleteCategory = (id: number) => {
    const category = categories.find((cat) => cat.id === id);
    const categoryName =
      category?.translations.find((t) => t.language === 'en')?.name ||
      category?.translations[0]?.name ||
      'Unknown Category';

    setDeleteModal({
      open: true,
      id,
      name: categoryName,
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:3000/categories/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCategories();
        setDeleteModal({ ...deleteModal, open: false });
      } else {
        setError('Failed to delete category');
      }
    } catch {
      setError('Failed to delete category');
    }
  };

  const handleEdit = (item: Category | Product | User | Blog) => {
    setCreateDrawerOpen(false);
    if ('translations' in item && 'subcategories' in item) {
      setEditingCategory({ ...item } as Category);
    }
  };

  const handleEditComplete = () => {
    setEditingCategory(null);
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
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
        title={t('categories')}
        onAdd={() => {
          setEditingCategory(null);
          setCreateDrawerOpen(true);
        }}
      />

      <CardsWrapper>
        {categories.map((cat) => (
          <CardComponent
            key={cat.id}
            item={cat}
            onDelete={handleDeleteCategory}
            onEdit={handleEdit}
          />
        ))}
      </CardsWrapper>

      <PageHeader title={t('subcategories')} />
      <CardsWrapper>
        {categories
          .flatMap((cat) => cat.subcategories || [])
          .map((sub) => (
            <CardComponent
              key={sub.id}
              item={sub}
              onDelete={handleDeleteCategory}
              onEdit={handleEdit}
            />
          ))}
      </CardsWrapper>

      <CreateEditDrawer
        onCategoryCreated={fetchCategories}
        editCategory={editingCategory}
        onEditComplete={handleEditComplete}
        activeSection="categories"
        open={Boolean(editingCategory || createDrawerOpen)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null);
            setCreateDrawerOpen(false);
          }
        }}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={confirmDelete}
        title="Delete Category"
        itemName={deleteModal.name}
      />
    </>
  );
}

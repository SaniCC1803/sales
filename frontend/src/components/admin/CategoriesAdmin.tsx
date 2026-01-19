import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CardComponent from "@/components/Card";
import CreateEditDrawer from "@/components/forms/CreateEditDrawer";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { User } from "@/types/user";
import type { Blog } from "@/types/blog";

export default function CategoriesAdmin() {
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
    fetchWithAuth("http://localhost:3000/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setError("Failed to load categories"));
  };

  const handleDeleteCategory = (id: number) => {
    const category = categories.find(cat => cat.id === id);
    const categoryName = category?.translations.find(t => t.language === 'en')?.name ||
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
    // Only allow editing if item is a Category
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

  return (
    <>
      <div className="w-full flex justify-end items-center mb-6">
        <Button variant="outline" onClick={() => { setEditingCategory(null); setCreateDrawerOpen(true); }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <CardComponent
            key={cat.id}
            item={cat}
            onDelete={handleDeleteCategory}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Subcategories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories
          .flatMap(cat => cat.subcategories || [])
          .map(sub => (
            <CardComponent
              key={sub.id}
              item={sub}
              onDelete={handleDeleteCategory}
              onEdit={handleEdit}
            />
          ))}
      </div>

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
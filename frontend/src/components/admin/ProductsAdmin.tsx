import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import CardComponent from '@/components/Card';
import CreateEditDrawer from '@/components/forms/CreateEditDrawer';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import type { Product } from '@/types/product';
import type { Item } from '../Card';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { PageHeader } from './pageParts/PageHeader';
import { CardsWrapper } from './pageParts/CardsWrapper';

export default function ProductsAdmin() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const fetchProducts = () => {
    fetchWithAuth(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setError('Failed to load products'));
  };

  const handleDeleteProduct = (id: number) => {
    const product = products.find((p) => p.id === id);
    const productName =
      product?.translations.find((t) => t.language === 'en')?.name ||
      product?.translations[0]?.name ||
      'Unknown Product';
    setDeleteModal({
      open: true,
      id,
      name: productName,
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/products/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchProducts();
        setDeleteModal({ ...deleteModal, open: false });
      } else {
        setError('Failed to delete product');
      }
    } catch {
      setError('Failed to delete product');
    }
  };

  const handleEdit = (item: Item) => {
    setCreateDrawerOpen(false);
    setEditingProduct({ ...item } as Product);
  };

  const handleEditComplete = () => {
    setEditingProduct(null);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
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
        title={t('products')}
        onAdd={() => {
          setEditingProduct(null);
          setCreateDrawerOpen(true);
        }}
      />

      <CardsWrapper>
        {products.map((product) => (
          <CardComponent
            key={product.id}
            item={product}
            onDelete={handleDeleteProduct}
            onEdit={handleEdit}
            onPromote={async (id) => {
              await fetchWithAuth(`${import.meta.env.VITE_API_URL}/products/${id}/promote`, { method: 'POST' });
              fetchProducts();
            }}
          />
        ))}
      </CardsWrapper>

      <CreateEditDrawer
        onProductCreated={fetchProducts}
        editProduct={editingProduct}
        onProductEditComplete={handleEditComplete}
        activeSection="products"
        open={Boolean(editingProduct || createDrawerOpen)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
            setCreateDrawerOpen(false);
          }
        }}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={confirmDelete}
        title={t('deleteProduct')}
        itemName={deleteModal.name}
      />
    </>
  );
}

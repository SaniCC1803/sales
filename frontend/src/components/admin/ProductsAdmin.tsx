import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CardComponent from "@/components/Card";
import CreateEditDrawer from "@/components/forms/CreateEditDrawer";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { User } from "@/types/user";

export default function ProductsAdmin() {
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
    fetchWithAuth("http://localhost:3000/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setError("Failed to load products"));
  };

  const handleDeleteProduct = (id: number) => {
    const product = products.find(p => p.id === id);
    const productName = product?.translations.find(t => t.language === 'en')?.name ||
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
      const res = await fetchWithAuth(`http://localhost:3000/products/${deleteModal.id}`, {
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

  const handleEdit = (item: Category | Product | User) => {
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

  return (
    <>
      <div className="w-full flex justify-end items-center mb-6">
        <Button variant="outline" onClick={() => { setEditingProduct(null); setCreateDrawerOpen(true); }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <CardComponent
            key={product.id}
            item={product}
            onDelete={handleDeleteProduct}
            onEdit={handleEdit}
          />
        ))}
      </div>

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
        title="Delete Product"
        itemName={deleteModal.name}
      />
    </>
  );
}
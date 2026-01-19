import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CardComponent from '../components/Card';
import type { Category } from '../types/category';
import type { Product } from '../types/product';

interface CategoryResponse {
  category: Category;
  subcategories: Category[];
  products: Product[];
}

const CategoryViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/categories/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch category');
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="container mx-auto px-6 py-12">
      <Breadcrumbs category={data.category} />
      <h1 className="text-2xl font-bold mb-4">
        {data.category.translations[0]?.name || 'Unnamed'}
      </h1>
      {data.subcategories.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-6 text-center sm:text-left">Subcategories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {data.subcategories.map((sub) => (
              <CardComponent key={sub.id} item={sub} />
            ))}
          </div>
        </>
      )}
      {data.products.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-6 text-center sm:text-left">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.products.map((prod) => (
              <CardComponent key={prod.id} item={prod} />
            ))}
          </div>
        </>
      )}
      {data.subcategories.length === 0 && data.products.length === 0 && (
        <div className="text-gray-500 mt-8">
          No subcategories or products found in this category.
        </div>
      )}
    </div>
  );
};

export default CategoryViewPage;

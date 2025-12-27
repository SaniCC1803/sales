
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Product } from '../types/product';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
      })
      .then(setProduct)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!product) return null;

  // Build breadcrumbs array: Home > ...category... > Product
  const breadcrumbs = [];
  breadcrumbs.push({ name: 'Home', url: '/' });
  if (product.category) {
    breadcrumbs.push({ name: product.category.translations[0]?.name || 'Unnamed', url: `/category/${product.category.id}` });
  }
  breadcrumbs.push({ name: product.translations[0]?.name || 'Product', url: null });

  return (
    <div className="container mx-auto px-6 py-12">
      <nav className="text-sm mb-4 text-left" aria-label="Breadcrumb">
        <ol className="list-none p-0 flex flex-wrap items-center">
          {breadcrumbs.map((crumb, idx) => (
            <li key={idx} className="flex items-center">
              {idx !== 0 && <span className="mx-2 text-muted-foreground">/</span>}
              {crumb.url && idx !== breadcrumbs.length - 1 ? (
                <a href={crumb.url} className="text-foreground hover:underline">{crumb.name}</a>
              ) : (
                <span className="text-muted-foreground">{crumb.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="text-2xl font-bold mb-4">{product.translations[0]?.name || 'Product'}</h1>
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {product.images && product.images.length > 0 ? (
          product.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={product.translations[0]?.name}
              className="w-full max-w-xs rounded shadow border"
              style={{ minWidth: 200, maxHeight: 220, objectFit: 'cover' }}
            />
          ))
        ) : (
          <div className="text-gray-400">No images</div>
        )}
      </div>
      <div className="mb-4 text-lg font-semibold">Price: {product.price}</div>
      <div className="mb-4">{product.translations[0]?.description}</div>
      <div className="text-gray-500 text-sm">Product ID: {product.id}</div>
    </div>
  );
};

export default ProductDetailPage;

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import ProductCarousel from '@/components/ProductCarousel';
import type { Category } from '@/types/category';
import type { Application } from '../types/application';
import type { Product } from '@/types/product';
import { useTranslation } from 'react-i18next';
import CardComponent from '@/components/Card';
import CardGrid from '@/components/CardGrid';
import PromotedProduct from '@/components/PromotedProduct';
import { Loader } from 'lucide-react';

type HomePageProps = {
  application: Application;
};

export default function HomePage({ application }: HomePageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);

    (async () => {
      const [{ data: categories }, { data: products }] = await Promise.all([
        apiFetch<Category[]>('/categories'),
        apiFetch<Product[]>('/products'),
      ]);
      // Optionally handle errors here (e.g., show a toast)
      setCategories(categories || []);
      const allSubcategories = (categories || []).flatMap((cat: Category) => cat.subcategories || []);
      setSubcategories(allSubcategories);
      setProducts(products || []);
      setLoading(false);
    })();
  }, []);

  const promotedProduct = products.find((p) => p.promoted);

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <>
          <ProductCarousel images={application.carousel || []} />
          <section className="container px-6 py-12 flex flex-col gap-10">
            {promotedProduct && <PromotedProduct product={promotedProduct} />}
            <CardGrid title={t('categories')}>
              {categories.map((cat) => (
                <CardComponent key={cat.id} item={cat} />
              ))}
            </CardGrid>
            {subcategories.length > 0 && (
              <CardGrid title={t('subcategories')}>
                {subcategories.map((subcat) => (
                  <CardComponent key={subcat.id} item={subcat} />
                ))}
              </CardGrid>
            )}
            <CardGrid title={t('products')}>
              {products.map((product) => (
                <CardComponent key={product.id} item={product} />
              ))}
            </CardGrid>
          </section>
        </>
      )}
    </>
  );
}

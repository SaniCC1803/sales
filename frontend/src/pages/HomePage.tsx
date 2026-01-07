import { useEffect, useState } from "react";
import ProductCarousel from "@/components/ProductCarousel";
import type { Category } from "@/types/category";
import type { Application } from "../types/application";
import type { Product } from "@/types/product";
import { useTranslation } from "react-i18next";
import CardComponent from "@/components/Card";
import CardGrid from "@/components/CardGrid";
import { Loader } from "lucide-react";

type HomePageProps = {
  application: Application;
};

export default function HomePage({ application }: HomePageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch("http://localhost:3000/categories").then((res) => res.json()),
      fetch("http://localhost:3000/products").then((res) => res.json())
    ])
      .then(([categories, products]) => {
        setCategories(categories);
        setProducts(products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {loading && <Loader />}
      {!loading &&
        <>
          <ProductCarousel images={application.carousel || []} />
          <section className="container px-6 py-12 flex flex-col gap-10">
            <CardGrid title={t("categories")}>
              {categories.map((cat) => (
                <CardComponent key={cat.id} item={cat} />
              ))}
            </CardGrid>
            <CardGrid title={t("products")}>
              {products.map((product) => (
                <CardComponent key={product.id} item={product} />
              ))}
            </CardGrid>
          </section>
        </>
      }
    </>
  );
}

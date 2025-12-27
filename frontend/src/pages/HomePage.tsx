import { useEffect, useState } from "react";
import ProductCarousel from "@/components/ProductCarousel";
import type { Category } from "@/types/category";
import type { Application } from "../types/application";
import { useTranslation } from "react-i18next";
import CardComponent from "@/components/Card";

type HomePageProps = {
  application: Application;
};

export default function HomePage({ application }: HomePageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  return (
    <>
      <ProductCarousel images={application.carousel || []} />
      <section className="container mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold mb-6 text-center sm:text-left">{t("categories")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CardComponent key={cat.id} item={cat} />
          ))}
        </div>
      </section>
    </>
  );
}

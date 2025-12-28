import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Category } from "@/types/category";
import { useLanguage } from "@/context/LanguageContext";

export default function CategoryNav() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/about-us')) return null;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then((res) => res.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!categories.length) return null;

  // Flatten all categories and subcategories into a single array for rendering with dividers
  const navItems = categories.flatMap((cat) => [
    {
      id: cat.id,
      name: cat.translations.find(t => t.language === language)?.name || cat.translations[0]?.name,
      to: `/category/${cat.id}`,
      isMain: true,
    },
    ...(cat.subcategories?.map(sub => ({
      id: sub.id,
      name: sub.translations.find(t => t.language === language)?.name || sub.translations[0]?.name,
      to: `/category/${sub.id}`,
      isMain: false,
    })) || [])
  ]);

  return (
    <nav className="w-full overflow-x-auto whitespace-nowrap bg-muted border-y border-border py-2 px-8 flex justify-between items-center" style={{minHeight: '2.5rem'}}>
      {navItems.map((item, idx) => (
        <React.Fragment key={item.id}>
          <Link
            to={item.to}
            className={item.isMain ? "font-medium text-foreground hover:underline hover:text-foreground px-2" : "text-muted-foreground hover:underline hover:text-muted-foreground px-2"}
            style={{ color: 'inherit' }}
          >
            {item.name}
          </Link>
          {idx < navItems.length - 1 && (
            <span className="border-r border-border h-6 mx-2" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

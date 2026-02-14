import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';

export default function CategoryNav() {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!categories.length) return null;
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/about-us'))
    return null;

  // Flatten all categories and subcategories into a single array for rendering with dividers
  const navItems = categories.flatMap((cat) => [
    {
      id: cat.id,
      name:
        cat.translations.find((t) => t.language === language)?.name || cat.translations[0]?.name,
      to: `/category/${cat.id}`,
      isMain: true,
    },
    ...(cat.subcategories?.map((sub) => ({
      id: sub.id,
      name:
        sub.translations.find((t) => t.language === language)?.name || sub.translations[0]?.name,
      to: `/category/${sub.id}`,
      isMain: false,
    })) || []),
  ]);

  return (
    <nav
      className="w-full overflow-x-auto whitespace-nowrap bg-primary text-primary-foreground border-b-2 border-[color:var(--background)] py-2 px-8 flex justify-between items-center"
      style={{ minHeight: '2.5rem', borderBottomColor: 'var(--background)' }}
    >
      {navItems.map((item, idx) => (
        <React.Fragment key={item.id}>
          <Link
            to={item.to}
            className={
              item.isMain
                ? 'font-medium hover:underline px-2'
                : 'text-muted-foreground hover:underline px-2'
            }
            style={{ color: 'inherit' }}
          >
            {item.name}
          </Link>
          {idx < navItems.length - 1 && (
            <span className="border-r-2" style={{ borderColor: 'var(--background)', height: '2rem', margin: '0 1rem' }} />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

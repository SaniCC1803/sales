import React, { useEffect, useMemo, useState } from 'react';
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

  const MAX_ITEMS = 6;

  // Flatten all categories and subcategories into a single array (translations kept so the
  // localized name can be resolved at render time without reshuffling on language change).
  const allItems = useMemo(
    () =>
      categories.flatMap((cat) => [
        {
          id: cat.id,
          translations: cat.translations,
          to: `/category/${cat.id}`,
          isMain: true,
        },
        ...(cat.subcategories?.map((sub) => ({
          id: sub.id,
          translations: sub.translations,
          to: `/category/${sub.id}`,
          isMain: false,
        })) || []),
      ]),
    [categories],
  );

  // Pick up to MAX_ITEMS at random. Reshuffled whenever the category data (re)loads.
  const navItems = useMemo(() => {
    const arr = [...allItems];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, MAX_ITEMS);
  }, [allItems]);

  if (loading) return null;
  if (!categories.length) return null;
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/about-us'))
    return null;

  return (
    <nav
      className="w-full bg-primary text-primary-foreground border-b-2 border-[color:var(--background)]"
      style={{ minHeight: '2.5rem', borderBottomColor: 'var(--background)' }}
    >
      <div className="w-full max-w-screen-2xl mx-auto overflow-x-auto md:overflow-x-hidden whitespace-nowrap py-2 px-4 md:px-8 flex justify-between items-center text-sm md:text-[clamp(0.7rem,0.9vw,0.95rem)]">
        {navItems.map((item, idx) => (
          <React.Fragment key={item.id}>
            <Link
              to={item.to}
              className={
                item.isMain
                  ? 'font-medium hover:underline px-2 md:px-1'
                  : 'text-muted-foreground hover:underline px-2 md:px-1'
              }
              style={{ color: 'inherit' }}
            >
              {item.translations.find((t) => t.language === language)?.name ||
                item.translations[0]?.name}
            </Link>
            {idx < navItems.length - 1 && (
              <span className="border-r-2 mx-2 md:mx-[clamp(0.2rem,0.6vw,1rem)]" style={{ borderColor: 'var(--background)', height: '2rem' }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}

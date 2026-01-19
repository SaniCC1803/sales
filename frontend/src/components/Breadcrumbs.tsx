import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../types/category';

interface BreadcrumbsProps {
  category: Category;
}

// Helper to build breadcrumb path from category up to root
function buildBreadcrumbs(category: Category): { id: number; name: string }[] {
  // Only the current category is available, since parent object is not present
  return [{ id: category.id, name: category.translations[0]?.name || 'Unnamed' }];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ category }) => {
  const breadcrumbs = buildBreadcrumbs(category);
  return (
    <nav className="text-sm mb-4 text-left" aria-label="Breadcrumb">
      <ol className="list-none p-0 flex flex-wrap items-center">
        <li>
          <Link to="/" className="text-foreground hover:underline">
            Home
          </Link>
        </li>
        {breadcrumbs.map((crumb, idx) => (
          <li key={crumb.id} className="flex items-center">
            <span className="mx-2 text-muted-foreground">/</span>
            {idx === breadcrumbs.length - 1 ? (
              <span className="text-muted-foreground">{crumb.name}</span>
            ) : (
              <Link to={`/category/${crumb.id}`} className="text-foreground hover:underline">
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

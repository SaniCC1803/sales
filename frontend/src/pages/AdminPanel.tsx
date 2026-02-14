import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import CategoriesAdmin from '@/components/admin/CategoriesAdmin';
import ProductsAdmin from '@/components/admin/ProductsAdmin';
import ApplicationsAdmin from '@/components/admin/ApplicationsAdmin';
import UsersAdmin from '@/components/admin/UsersAdmin';
import BlogsAdmin from '@/components/admin/BlogsAdmin';
import ContactsAdmin from '@/components/admin/ContactsAdmin';

export default function Page() {
  const location = useLocation();

  const getActiveSectionFromPath = (pathname: string) => {
    if (pathname === '/admin/products') return 'products';
    if (pathname === '/admin/categories') return 'categories';
    if (pathname === '/admin/applications') return 'applications';
    if (pathname === '/admin/users') return 'users';
    if (pathname === '/admin/blogs') return 'blogs';
    if (pathname === '/admin/contacts') return 'contacts';
    return 'categories';
  };

  const [activeSection, setActiveSection] = useState<
    'categories' | 'applications' | 'products' | 'users' | 'blogs' | 'contacts'
  >(getActiveSectionFromPath(location.pathname));

  useEffect(() => {
    const newSection = getActiveSectionFromPath(location.pathname);
    setActiveSection(newSection);
  }, [location.pathname]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'categories':
        return <CategoriesAdmin />;
      case 'products':
        return <ProductsAdmin />;
      case 'applications':
        return <ApplicationsAdmin />;
      case 'users':
        return <UsersAdmin />;
      case 'blogs':
        return <BlogsAdmin />;
      case 'contacts':
        return <ContactsAdmin />;
      default:
        return <CategoriesAdmin />;
    }
  };

  return (
    <SidebarProvider>
        <AppSidebar onSectionChange={setActiveSection} className="h-screen fixed left-0 top-24 z-30" />
        <SidebarInset className="bg-muted text-muted-foreground min-h-screen">
          <section className="flex flex-col container mx-auto px-6 py-6 gap-6">{renderActiveSection()}</section>
      </SidebarInset>
    </SidebarProvider>
  );
}


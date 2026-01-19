import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import CategoriesAdmin from '@/components/admin/CategoriesAdmin';
import ProductsAdmin from '@/components/admin/ProductsAdmin';
import ApplicationsAdmin from '@/components/admin/ApplicationsAdmin';
import UsersAdmin from '@/components/admin/UsersAdmin';
import BlogsAdmin from '@/components/admin/BlogsAdmin';
import { useTranslation } from 'react-i18next';

export default function Page() {
  const location = useLocation();
  const { t } = useTranslation();

  const getActiveSectionFromPath = (pathname: string) => {
    if (pathname === '/admin/products') return 'products';
    if (pathname === '/admin/categories') return 'categories';
    if (pathname === '/admin/applications') return 'applications';
    if (pathname === '/admin/users') return 'users';
    if (pathname === '/admin/blogs') return 'blogs';
    return 'categories';
  };

  const [activeSection, setActiveSection] = useState<
    'categories' | 'applications' | 'products' | 'users' | 'blogs'
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
      default:
        return <CategoriesAdmin />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <SidebarInset className="bg-muted text-muted-foreground">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <h1 className="text-xl font-semibold capitalize">{t(activeSection)}</h1>
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
        </header>

        <section className="container mx-auto px-6 py-12">{renderActiveSection()}</section>
      </SidebarInset>
    </SidebarProvider>
  );
}

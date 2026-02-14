import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSectionChange: (
    section: 'categories' | 'applications' | 'products' | 'users' | 'blogs' | 'contacts'
  ) => void;
}

export function AppSidebar({ onSectionChange, ...props }: AppSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { title: 'users', value: 'users', path: '/admin/users' },
    { title: 'application', value: 'applications', path: '/admin/applications' },
    { title: 'categories', value: 'categories', path: '/admin/categories' },
    { title: 'products', value: 'products', path: '/admin/products' },
    { title: 'blogs', value: 'blogs', path: '/admin/blogs' },
    { title: 'contacts', value: 'contacts', path: '/admin/contacts' },
  ];

  return (
    <Sidebar className="relative" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? 'text-primary bg-primary/10 hover:bg-primary/20'
                          : 'text-muted-foreground hover:text-foreground'
                      }
                    >
                      <Link
                        to={item.path}
                        className="w-full text-left"
                        onClick={() =>
                          onSectionChange(
                            item.value as
                              | 'categories'
                              | 'applications'
                              | 'products'
                              | 'users'
                              | 'blogs'
                              | 'contacts'
                          )
                        }
                      >
                        {t(item.title)}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

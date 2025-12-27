import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection: "categories" | "applications" | "products" | "users";
  onSectionChange: (section: "categories" | "applications" | "products" | "users") => void;
}

export function AppSidebar({ activeSection, onSectionChange, ...props }: AppSidebarProps) {
  const { t } = useTranslation();

  const navItems = [
    { title: "users", value: "users" },
    { title: "application", value: "applications" },
    { title: "categories", value: "categories" },
    { title: "products", value: "products" },
  ];

  return (
    <Sidebar className="relative" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeSection === item.value}
                    onClick={() => onSectionChange(item.value as "categories" | "applications" | "products" | "users")}
                  >
                    <button className="w-full text-left">
                      {t(item.title)}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

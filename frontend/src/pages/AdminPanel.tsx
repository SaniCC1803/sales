import { AppSidebar } from "@/components/app-sidebar";
import CardComponent from "@/components/Card";
import CreateEditDrawer from "@/components/CreateEditDrawer";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Application } from "@/types/application";
import type { Category } from "@/types/category";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Page() {
  const [activeSection, setActiveSection] = useState<"categories" | "applications">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: 'category' | 'application';
    id: number;
    name: string;
  }>({
    open: false,
    type: 'category',
    id: 0,
    name: '',
  });
  const { t } = useTranslation();

  const fetchCategories = () => {
    fetch("http://localhost:3000/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setError("Failed to load categories"));
  };

  const fetchApps = () => {
    fetch("http://localhost:3000/applications")
      .then((res) => res.json())
      .then(setApps)
      .catch(() => setError("Failed to load apps"));
  };

  const handleDeleteCategory = (id: number) => {
    const category = categories.find(cat => cat.id === id);
    const categoryName = category?.translations.find(t => t.language === 'en')?.name || 
                        category?.translations[0]?.name || 
                        'Unknown Category';
    
    setDeleteModal({
      open: true,
      type: 'category',
      id,
      name: categoryName,
    });
  };

  const handleDeleteApp = (id: number) => {
    const app = apps.find(application => application.id === id);
    const appName = app?.translations.find(t => t.language === 'en')?.name || 
                   app?.translations[0]?.name || 
                   'Unknown Application';
    
    setDeleteModal({
      open: true,
      type: 'application',
      id,
      name: appName,
    });
  };

  const confirmDelete = async () => {
    try {
      const endpoint = deleteModal.type === 'category' ? 'categories' : 'applications';
      const res = await fetch(`http://localhost:3000/${endpoint}/${deleteModal.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        if (deleteModal.type === 'category') {
          fetchCategories();
        } else {
          fetchApps();
        }
        setDeleteModal({ ...deleteModal, open: false });
      } else {
        setError(`Failed to delete ${deleteModal.type}`);
      }
    } catch (error) {
      setError(`Failed to delete ${deleteModal.type}`);
    }
  };

  const handleEdit = (item: Category | Application) => {
    if (activeSection === 'categories') {
      setEditingCategory(item as Category);
    } else {
      // TODO: Implement application edit
      console.log("Edit application:", item);
    }
  };

  const handleEditComplete = () => {
    setEditingCategory(null);
    fetchCategories(); // Refresh the list
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <SidebarInset className="bg-muted text-muted-foreground">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <div className="w-full flex justify-between">
            <h1 className="text-xl font-semibold capitalize">{t(activeSection)}</h1>
            {/* <Button onClick={() => console.log("onClick")} variant="outline" className="flex items-center gap-2">
              <Plus size={16} />
            </Button> */}
            <CreateEditDrawer 
              onCategoryCreated={fetchCategories}
              editCategory={editingCategory}
              onEditComplete={handleEditComplete}
            />
          </div>
        </header>

        <section className="container mx-auto px-6 py-12">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activeSection === "categories"
              ? categories.map((cat) => (
                <CardComponent 
                  key={cat.id} 
                  item={cat} 
                  onDelete={handleDeleteCategory}
                  onEdit={handleEdit}
                />
              ))
              : apps.map((app) => (
                <CardComponent 
                  key={app.id} 
                  item={app} 
                  onDelete={handleDeleteApp}
                  onEdit={handleEdit}
                />
              ))}
          </div>
        </section>
      </SidebarInset>

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={confirmDelete}
        title={`Delete ${deleteModal.type === 'category' ? 'Category' : 'Application'}`}
        itemName={deleteModal.name}
      />
    </SidebarProvider>
  );
}

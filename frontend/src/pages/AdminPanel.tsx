import { AppSidebar } from "@/components/app-sidebar";
import CardComponent from "@/components/Card";
import CreateEditDrawer from "@/components/forms/CreateEditDrawer";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Application } from "@/types/application";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { User } from "@/types/user";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useTranslation } from "react-i18next";
import { Edit3, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageGallery from "@/components/ImageGallery";

export default function Page() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'mk';
  const [activeSection, setActiveSection] = useState<"categories" | "applications" | "products" | "users">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingApplication, setEditingApplication] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // For opening drawer in create mode
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  // Image gallery modal state
  const [imageGallery, setImageGallery] = useState<{
    open: boolean;
    images: string[];
    currentIndex: number;
  }>({
    open: false,
    images: [],
    currentIndex: 0,
  });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: 'category' | 'product' | 'user';
    id: number;
    name: string;
  }>({
    open: false,
    type: 'category',
    id: 0,
    name: '',
  });

  const fetchCategories = () => {
    fetchWithAuth("http://localhost:3000/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setError("Failed to load categories"));
  };

  const fetchProducts = () => {
    fetchWithAuth("http://localhost:3000/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setError("Failed to load products"));
  };

  const fetchApplication = () => {
    // Fetch current user's application - you may need to adjust this endpoint
    // based on your authentication system
    fetchWithAuth("http://localhost:3000/applications/current")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 404) {
          return null; // No application exists for this user
        }
        throw new Error('Failed to fetch application');
      })
      .then((data) => {
        console.log('Application data:', data);
        setApplication(data);
      })
      .catch((error) => {
        console.error("Error fetching application:", error);
        setApplication(null);
        // Don't set error state here since no application is normal
      });
  };

  const fetchUsers = () => {
    fetchWithAuth("http://localhost:3000/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setError("Failed to load users"));
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

  const handleDeleteProduct = (id: number) => {
    const product = products.find(p => p.id === id);
    const productName = product?.translations.find(t => t.language === 'en')?.name ||
      product?.translations[0]?.name ||
      'Unknown Product';
    setDeleteModal({
      open: true,
      type: 'product',
      id,
      name: productName,
    });
  };

  const handleDeleteUser = (id: number) => {
    const user = users.find(u => u.id === id);
    setDeleteModal({
      open: true,
      type: 'user',
      id,
      name: user?.email || 'Unknown User',
    });
  };

  const confirmDelete = async () => {
    try {
      let endpoint = '';
      if (deleteModal.type === 'category') {
        endpoint = 'categories';
      } else if (deleteModal.type === 'product') {
        endpoint = 'products';
      } else if (deleteModal.type === 'user') {
        endpoint = 'users';
      }

      const res = await fetchWithAuth(`http://localhost:3000/${endpoint}/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (deleteModal.type === 'category') {
          fetchCategories();
        } else if (deleteModal.type === 'product') {
          fetchProducts();
        } else if (deleteModal.type === 'user') {
          fetchUsers();
        }
        setDeleteModal({ ...deleteModal, open: false });
      } else {
        setError(`Failed to delete ${deleteModal.type}`);
      }
    } catch {
      setError(`Failed to delete ${deleteModal.type}`);
    }
  };

  const handleEdit = (item: Category | Product | User) => {
    setCreateDrawerOpen(false); // Always reset create mode
    if (activeSection === 'categories') {
      setEditingCategory({ ...(item as Category) });
    } else if (activeSection === 'products') {
      setEditingProduct({ ...(item as Product) });
    } else if (activeSection === 'users') {
      setEditingUser({ ...(item as User) });
    }
  };

  const handleEditComplete = () => {
    setEditingCategory(null);
    fetchCategories(); // Refresh the list
  };

  const handleProductEditComplete = () => {
    setEditingProduct(null);
    fetchProducts(); // Refresh the list
  };

  const handleUserEditComplete = () => {
    setEditingUser(null);
    fetchUsers(); // Refresh the list
  };

  const handleApplicationEdit = () => {
    setEditingApplication(true);
  };

  const handleApplicationEditComplete = () => {
    setEditingApplication(false);
    fetchApplication(); // Refresh the application data
  };

  const openImageGallery = (images: string[], startIndex: number) => {
    setImageGallery({
      open: true,
      images,
      currentIndex: startIndex,
    });
  };

  const closeImageGallery = () => {
    setImageGallery(prev => ({ ...prev, open: false }));
  };

  const navigateGallery = (direction: 'prev' | 'next') => {
    setImageGallery(prev => ({
      ...prev,
      currentIndex: direction === 'next' 
        ? (prev.currentIndex + 1) % prev.images.length
        : (prev.currentIndex - 1 + prev.images.length) % prev.images.length
    }));
  };

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (imageGallery.open) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateGallery('prev');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateGallery('next');
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeImageGallery();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [imageGallery.open]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchApplication();
  }, []);

  useEffect(() => {
    fetchUsers();
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
          <div className="w-full flex justify-between items-center">
            <h1 className="text-xl font-semibold capitalize">{activeSection === "applications" ? t("application") : activeSection === "users" ? t("user") : t(activeSection)}</h1>
            <div className="flex items-center gap-4">
              {/* Plus button for each tab except applications (handled below) */}
              {activeSection === "categories" && (
                <Button variant="outline" onClick={() => { setEditingCategory(null); setCreateDrawerOpen(true); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {activeSection === "products" && (
                <Button variant="outline" onClick={() => { setEditingProduct(null); setCreateDrawerOpen(true); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {activeSection === "users" && (
                <Button variant="outline" onClick={() => { setEditingUser(null); setCreateDrawerOpen(true); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <CreateEditDrawer
                onCategoryCreated={fetchCategories}
                onProductCreated={fetchProducts}
                onApplicationCreated={fetchApplication}
                onUserCreated={fetchUsers}
                editCategory={editingCategory}
                editProduct={editingProduct}
                editApplication={editingApplication ? application : null}
                editUser={editingUser}
                onEditComplete={handleEditComplete}
                onProductEditComplete={handleProductEditComplete}
                onApplicationEditComplete={handleApplicationEditComplete}
                onUserEditComplete={handleUserEditComplete}
                activeSection={activeSection}
                open={Boolean(editingCategory || editingProduct || editingUser || editingApplication || createDrawerOpen)}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingCategory(null);
                    setEditingProduct(null);
                    setEditingUser(null);
                    setEditingApplication(false);
                    setCreateDrawerOpen(false);
                  }
                }}
              />
            </div>
          </div>
        </header>

        <section className="container mx-auto px-6 py-12">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {activeSection === "applications" ? (
            <div className="bg-card border rounded-xl p-8 shadow-sm">
              {application ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-bold text-foreground">{t("applicationInformation")}</h2>
                    <Button onClick={handleApplicationEdit} variant="outline" size="lg">
                      <Edit3 className="h-4 w-4 mr-2" />
                      {t("edit")}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {application.logo && (
                      <div className="lg:col-span-1">
                        <label className="text-sm font-bold text-primary mb-3 block uppercase tracking-wide">{t("logo")}</label>
                        <div className="bg-muted/30 border border-border rounded-lg p-6 flex items-center justify-center">
                          <img
                            src={application.logo.startsWith('http') ? application.logo : `http://localhost:3000${application.logo}`}
                            alt="Application Logo"
                            className="max-w-full max-h-48 object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    <div className={`${application.logo ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                      <div>
                        <label className="text-sm font-bold text-primary mb-3 block uppercase tracking-wide">{t("name")}</label>
                        <p className="text-2xl font-bold text-foreground">
                          {application.translations.find(t => t.language === currentLanguage)?.name ||
                            application.translations.find(t => t.language === 'en')?.name ||
                            application.translations[0]?.name || 'Unnamed Application'}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-primary mb-3 block uppercase tracking-wide">{t("description")}</label>
                        <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                          {application.translations.find(t => t.language === currentLanguage)?.description ||
                            application.translations.find(t => t.language === 'en')?.description ||
                            application.translations[0]?.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Carousel Images Section */}
                  {application.carousel && application.carousel.length > 0 && (
                    <div className="mt-8">
                      <label className="text-sm font-bold text-primary mb-3 block uppercase tracking-wide">{t("carouselImages")}</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {application.carousel.map((img, idx) => (
                          <div 
                            key={idx} 
                            className="bg-muted/30 border border-border rounded-lg p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => openImageGallery(application.carousel, idx)}
                          >
                            <img
                              src={img.startsWith('http') ? img : `http://localhost:3000${img}`}
                              alt={`Carousel ${idx + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                            <p className="text-xs text-muted-foreground mt-2 text-center">Image {idx + 1}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold mb-4 text-muted-foreground">{t("noApplication")}</h3>
                    <Button onClick={() => setEditingApplication(true)} size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("createApplication")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : activeSection === "users" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {users.map((user) => (
                <CardComponent
                  key={user.id}
                  item={user}
                  onDelete={handleDeleteUser}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <>
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
                  : products.map((product) => (
                    <CardComponent
                      key={product.id}
                      item={product}
                      onDelete={handleDeleteProduct}
                      onEdit={handleEdit}
                    />
                  ))}
              </div>
              {activeSection === "categories" && (
                <>
                  <h2 className="text-xl font-semibold mt-8 mb-4">Subcategories</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {categories
                      .flatMap(cat => cat.subcategories || [])
                      .map(sub => (
                        <CardComponent
                          key={sub.id}
                          item={sub}
                          onDelete={handleDeleteCategory}
                          onEdit={handleEdit}
                        />
                      ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </SidebarInset>

      <ConfirmDeleteModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={confirmDelete}
        title={`Delete ${deleteModal.type === 'category' ? 'Category' : deleteModal.type === 'product' ? 'Product' : 'User'}`}
        itemName={deleteModal.name}
      />

      <ImageGallery
        images={imageGallery.images}
        isOpen={imageGallery.open}
        initialIndex={imageGallery.currentIndex}
        onClose={closeImageGallery}
        title="Carousel Images"
      />
    </SidebarProvider>
  );
}

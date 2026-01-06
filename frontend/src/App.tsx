import "../i18n";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Header from "./components/header";
import Footer from "./components/footer";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./components/theme-provider";
import AboutPage from "./pages/AboutPage";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import type { Application } from "./types/application";
import "@/App.css";
import { SidebarProvider } from "./components/ui/sidebar";
import { restoreTheme } from "./lib/utils";

import CategoryViewPage from "./pages/CategoryViewPage";
import ProductDetailPage from "./pages/ProductDetailPage";

export default function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore the saved color theme on app start
    restoreTheme();
    
    fetch("http://localhost:3000/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <LanguageProvider>
        <SidebarProvider>
          <div className="flex flex-col w-full">
            <Header application={applications[0]} />
            <main className="flex-grow bg-muted text-background-foreground">
              <Routes>
                <Route path="/" element={<HomePage application={applications[0]} />} />
                <Route path="/about-us" element={<AboutPage />} />
                <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                <Route path="/category/:id" element={<CategoryViewPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
              </Routes>
            </main>
            <Footer availableLanguages={applications[0].languages} />
          </div>
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

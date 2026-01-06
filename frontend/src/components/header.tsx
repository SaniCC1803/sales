'use client';

import type { Application } from "@/types/application";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "i18next";
import { Button } from "./ui/button";
import { useState } from "react";
import CloseIcon from "./icons/CloseIcon";
import HamburgerMenu from "./icons/HamburgerMenu";
import { ThemeSelector } from "./ThemeSelector";
import { ThemeTabs } from "./dark-light-mode-button";
import CategoryNav from "./CategoryNav";
import UserDropdown from "./ui/UserDropdown";
import { useLocation } from "react-router-dom";

type HeaderProps = {
  application: Application
}

export default function Header({ application }: HeaderProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  // Get user email from JWT (if present)
  let userEmail = "Unknown";
  try {
    const token = localStorage.getItem("userToken");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userEmail = payload.email || "Unknown";
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <>
      <header className="bg-background text-foreground sticky top-0 z-50 px-6 h-20 flex items-center justify-between relative">
      <Link to="/">
        <img
          src={application.logo}
          alt={`${application.translations.find((t) => t.language === language)?.name} logo`}
          className="h-8 w-auto object-contain cursor-pointer"
        />
      </Link>

      {/* Desktop */}
      <div>
        <nav className="hidden md:flex space-x-3 items-center">
          <Link to="/about-us" className="text-foreground hover:text-foreground" style={{ color: 'inherit' }}>
            {t("aboutUs")}
          </Link>
          <ThemeTabs />
          {/* ThemeSelector as dropdown with icon */}
          <ThemeSelector dropdown />
          {/* Show UserDropdown only on /admin route */}
          {location.pathname === "/admin" && (
            <UserDropdown
              email={userEmail}
              onLogout={() => {
                localStorage.removeItem("userToken");
                window.location.href = "/";
              }}
            />
          )}
        </nav>
      </div>

      {/* Mobile */}
      <Button
        className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
        onClick={() => setOpen(!open)}
        variant="outline"
        size="icon"
      >
        {open ? (
          <CloseIcon className="h-6 w-6 text-foreground" />
        ) : (
          <HamburgerMenu className="h-6 w-6 text-foreground" />
        )}
      </Button>

      {open && (
        <div className="absolute left-0 top-full w-full md:hidden bg-background shadow-md">
          <nav className="flex flex-col p-4 space-y-2">
            <Link onClick={() => setOpen(false)} className="text-foreground" to="/admin">
              {t("collections")}
            </Link>
            <Link onClick={() => setOpen(false)} className="text-foreground" to="/about-us">
              {t("aboutUs")}
            </Link>
            {/* ThemeSelector as dropdown with icon for mobile */}
            <div className="mt-2">
              <ThemeSelector dropdown onSelect={() => setOpen(false)} />
            </div>
          </nav>
        </div>
      )}
    </header>
    <CategoryNav />
    </>
  );
}

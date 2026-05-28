'use client';

import type { Application } from '@/types/application';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { t } from 'i18next';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import HamburgerMenu from './icons/HamburgerMenu';
import { ThemeSelector } from './ThemeSelector';
import { ThemeTabs } from './dark-light-mode-button';
import CategoryNav from './CategoryNav';
import UserDropdown from './ui/UserDropdown';
import { useLocation } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';

type HeaderProps = {
  application: Application;
};

async function fetchMyEmail(): Promise<string> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      credentials: 'include',
    });
    if (!res.ok) return 'Unknown';
    const data = await res.json();
    return data.email || 'Unknown';
  } catch (e) {
    console.error(e);
    return 'Unknown';
  }
}

export default function Header({ application }: HeaderProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string>('Unknown');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const refresh = () => fetchMyEmail().then(setUserEmail);
    refresh();
    window.addEventListener('auth-change', refresh);
    return () => {
      window.removeEventListener('auth-change', refresh);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className="text-foreground sticky top-0 z-50 h-28 backdrop-blur-md transition-colors duration-200"
        style={{
          backgroundColor: scrolled
            ? 'color-mix(in oklch, var(--background) 75%, transparent)'
            : 'var(--background)',
        }}
      >
        <div className="w-full max-w-screen-2xl mx-auto px-6 h-full flex items-center justify-between relative">
        <Link to="/">
          <img
            src={getImageUrl(application.logo)}
            alt={`${application.translations.find((t) => t.language === language)?.name} logo`}
            className="h-16 w-auto object-contain cursor-pointer"
          />
        </Link>

        {/* Desktop */}
        <div>
          <nav className="hidden md:flex space-x-3 items-center">
            <Link
              to="/blogs"
              className="text-foreground hover:text-foreground"
              style={{ color: 'inherit' }}
            >
              {t('blogs')}
            </Link>
            <span className="h-5 w-px bg-border" aria-hidden="true" />
            <Link
              to="/contact"
              className="text-foreground hover:text-foreground"
              style={{ color: 'inherit' }}
            >
              {t('contactUs')}
            </Link>
            <span className="h-5 w-px bg-border" aria-hidden="true" />
            <Link
              to="/about-us"
              className="text-foreground hover:text-foreground"
              style={{ color: 'inherit' }}
            >
              {t('aboutUs')}
            </Link>
            <ThemeTabs />
            {/* ThemeSelector as dropdown with icon */}
            <ThemeSelector dropdown />
            {/* Show UserDropdown on any route that includes '/admin' */}
            {location.pathname.includes('/admin') && (
              <UserDropdown
                email={userEmail}
                onLogout={async () => {
                  try {
                    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                      method: 'POST',
                      credentials: 'include',
                    });
                  } catch (e) {
                    console.error('Logout request failed', e);
                  }
                  window.location.href = '/';
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
                {t('collections')}
              </Link>
              <Link onClick={() => setOpen(false)} className="text-foreground" to="/blogs">
                {t('blogs')}
              </Link>
              <Link onClick={() => setOpen(false)} className="text-foreground" to="/about-us">
                {t('aboutUs')}
              </Link>
              {/* ThemeSelector as dropdown with icon for mobile */}
              <div className="mt-2">
                <ThemeSelector dropdown onSelect={() => setOpen(false)} />
              </div>
            </nav>
          </div>
        )}
        </div>
      </header>
      <CategoryNav />
    </>
  );
}

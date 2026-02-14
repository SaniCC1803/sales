import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { Label } from './ui/label';

type FooterProps = {
  availableLanguages: string[];
  appName: string;
};

export default function Footer({ availableLanguages, appName }: FooterProps) {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang as 'en' | 'mk');
  };

  return (
    <footer className="bg-background text-foreground h-12 px-6 py-2 flex justify-between items-center">
      <Label>&copy; 2026 {appName}</Label>

      {availableLanguages.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {language.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableLanguages.map((lang) => (
              <DropdownMenuCheckboxItem
                key={lang}
                checked={language === lang}
                onCheckedChange={() => changeLanguage(lang)}
                className="cursor-pointer"
              >
                {lang.toUpperCase()}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </footer>
  );
}

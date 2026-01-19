'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from './theme-provider';
import { Sun, MoonStar } from 'lucide-react';

export function ThemeTabs() {
  const { theme, setTheme } = useTheme();

  return (
    <Tabs
      value={theme}
      onValueChange={(value) => {
        const color = value === 'dark' ? 'dark' : 'light';
        setTheme(color);
      }}
    >
      <TabsList>
        <TabsTrigger
          value="light"
          className=" focus-visible:ring-0 bg-muted data-[state=active]:bg-background"
        >
          <Sun size={16} />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          className="focus-visible:ring-0 bg-muted data-[state=active]:bg-background"
        >
          <MoonStar size={16} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

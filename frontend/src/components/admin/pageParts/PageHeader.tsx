import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  onAdd?: () => void;
};

export function PageHeader({ title, onAdd }: PageHeaderProps) {
  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="h-4 md:hidden" />
          <h1 className="text-lg font-semibold tracking-tight capitalize">{title}</h1>
        </div>

        {onAdd && (
          <Button size="icon" variant="outline" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </header>
      <Separator orientation="horizontal" />
    </>
  );
}

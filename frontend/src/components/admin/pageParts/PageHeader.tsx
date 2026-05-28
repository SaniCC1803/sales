import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Edit3, Plus } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  onAdd?: () => void;
  onEdit?: () => void;
};

export function PageHeader({ title, onAdd, onEdit }: PageHeaderProps) {
  return (
    <>
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-9 w-9 border border-input bg-background text-foreground shadow-sm hover:bg-accent md:hidden [&_svg]:h-5 [&_svg]:w-5" />
          <Separator orientation="vertical" className="h-6 md:hidden" />
          <h1 className="text-lg font-semibold tracking-tight capitalize">{title}</h1>
        </div>

        {onAdd && (
          <Button size="icon" variant="outline" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button size="icon" variant="outline" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </header>
      <Separator orientation="horizontal" />
    </>
  );
}

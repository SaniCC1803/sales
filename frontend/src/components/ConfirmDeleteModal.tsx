import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
}

export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
}: ConfirmDeleteProps) {
  const { t } = useTranslation();
  
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            {title || t('deleteItem')}
          </DialogTitle>
          <DialogDescription>
            {description ||
              `${t('confirmDelete')} ${itemName ? `"${itemName}"` : t('thisItem')}? ${t('actionCannotBeUndone')}`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            className="bg-primary text-primary-foreground"
            onClick={handleConfirm}
          >
            {t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

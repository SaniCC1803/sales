import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImageGalleryProps {
  images: string[];
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
  title?: string;
}

export default function ImageGallery({
  images,
  isOpen,
  initialIndex = 0,
  onClose,
  title = 'Image Gallery',
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when gallery opens with new images
  useEffect(() => {
    if (isOpen && initialIndex !== undefined) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const navigateGallery = (direction: 'prev' | 'next') => {
    setCurrentIndex((prev) =>
      direction === 'next' ? (prev + 1) % images.length : (prev - 1 + images.length) % images.length
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && images.length > 0) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateGallery('prev');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateGallery('next');
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length]);

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>
            {title} ({currentIndex + 1} of {images.length})
          </DialogTitle>
        </DialogHeader>

        <div
          className="flex items-center justify-center relative p-4 pt-2"
          style={{ height: '60vh' }}
        >
          <img
            src={
              images[currentIndex]?.startsWith('http')
                ? images[currentIndex]
                : `http://localhost:3000${images[currentIndex]}`
            }
            alt={`Gallery image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />

          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={() => navigateGallery('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={() => navigateGallery('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 p-4 pt-0 justify-center overflow-x-auto max-w-full">
            {images.map((img, idx) => (
              <button
                key={idx}
                className={`flex-shrink-0 w-20 h-16 rounded border-2 overflow-hidden transition-all ${
                  idx === currentIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-muted hover:border-border'
                }`}
                onClick={() => setCurrentIndex(idx)}
              >
                <img
                  src={img.startsWith('http') ? img : `http://localhost:3000${img}`}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import ApplicationCardComponent from '@/components/ApplicationCardComponent';
import CreateEditDrawer from '@/components/forms/CreateEditDrawer';
import ImageGallery from '@/components/ImageGallery';
import type { Application } from '@/types/application';
import { useToast } from '@/hooks/use-toast';

export default function ApplicationsAdmin() {
  const { toast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingApplication, setEditingApplication] = useState<boolean>(false);
  const [creatingApplication, setCreatingApplication] = useState<boolean>(false);
  const [imageGallery, setImageGallery] = useState<{
    open: boolean;
    images: string[];
    currentIndex: number;
  }>({
    open: false,
    images: [],
    currentIndex: 0,
  });

  const fetchApplication = () => {
    fetchWithAuth('http://localhost:3000/applications/current')
      .then((res) => res.json())
      .then(setApplication)
      .catch(() => {
        setError('Failed to load application');
        setApplication(null);
      });
  };

  const handleApplicationEdit = () => {
    setEditingApplication(true);
  };

  const handleApplicationCreate = () => {
    setCreatingApplication(true);
  };

  const handleApplicationEditComplete = () => {
    setEditingApplication(false);
    setCreatingApplication(false);
    fetchApplication();
  };

  const openImageGallery = (images: string[], startIndex: number) => {
    setImageGallery({
      open: true,
      images,
      currentIndex: startIndex,
    });
  };

  const closeImageGallery = () => {
    setImageGallery((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return (
    <>
      <div className="w-full">
        <ApplicationCardComponent
          application={application}
          onEdit={handleApplicationEdit}
          onCreate={handleApplicationCreate}
          onCarouselImageClick={openImageGallery}
        />
      </div>

      <CreateEditDrawer
        onApplicationCreated={fetchApplication}
        editApplication={editingApplication ? application : null}
        onApplicationEditComplete={handleApplicationEditComplete}
        activeSection="applications"
        open={editingApplication || creatingApplication}
        onOpenChange={(open) => {
          if (!open) {
            setEditingApplication(false);
            setCreatingApplication(false);
          }
        }}
      />

      <ImageGallery
        images={imageGallery.images}
        isOpen={imageGallery.open}
        initialIndex={imageGallery.currentIndex}
        onClose={closeImageGallery}
        title="Carousel Images"
      />
    </>
  );
}

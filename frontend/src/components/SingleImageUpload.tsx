'use client';

import { useEffect, useState } from 'react';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';

type SingleImageUploadProps = {
  value?: File | null;
  existingImageUrl?: string;
  onChange?: (file: File | null) => void;
  onBlur?: () => void;
};

const SingleImageUpload = ({
  value,
  existingImageUrl,
  onChange,
  onBlur,
}: SingleImageUploadProps) => {
  const [file, setFile] = useState<File | null>(value ?? null);
  const [filePreview, setFilePreview] = useState<string | undefined>();

  useEffect(() => {
    setFile(value ?? null);
    if (value) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setFilePreview(e.target.result);
        }
      };
      reader.readAsDataURL(value);
    } else if (existingImageUrl) {
      // Handle both full URLs and relative paths
      const fullUrl = existingImageUrl.startsWith('http')
        ? existingImageUrl
        : `http://localhost:3000${existingImageUrl}`;
      setFilePreview(fullUrl);
    } else {
      setFilePreview(undefined);
    }
  }, [value, existingImageUrl]);

  const handleDrop = (acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0] ?? null;
    setFile(droppedFile);
    onChange?.(droppedFile);

    if (droppedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setFilePreview(e.target.result);
        }
      };
      reader.readAsDataURL(droppedFile);
    } else {
      setFilePreview(undefined);
    }

    onBlur?.();
  };

  const handleDiscard = () => {
    setFile(null);
    setFilePreview(undefined);
    onChange?.(null);
    onBlur?.();
  };

  return (
    <div className="space-y-2">
      {filePreview && (
        <div className="space-y-2">
          <div className="relative w-full h-[120px]">
            <img
              src={filePreview}
              alt={file?.name || 'Current image'}
              className="absolute top-0 left-0 h-full w-full object-cover rounded-md border"
            />
            <div className="absolute top-2 right-2">
              <Button
                size="icon"
                variant="ghost"
                className="p-1 bg-black/50 text-white hover:bg-black/70"
                onClick={handleDiscard}
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground truncate">{file?.name || 'Current image'}</p>
        </div>
      )}

      <Dropzone
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
        onDrop={handleDrop}
        onError={console.error}
        src={file ? [file] : undefined}
        className="min-h-[60px]"
      >
        <DropzoneEmptyState />
        <DropzoneContent>{/* Dropzone content for file selection */}</DropzoneContent>
      </Dropzone>
    </div>
  );
};

export default SingleImageUpload;

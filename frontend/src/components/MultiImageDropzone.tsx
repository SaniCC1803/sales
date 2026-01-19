import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { UploadIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Accepts both File (new uploads) and string (existing image URLs)
export type MultiImageValue = (File | string)[];

interface MultiImageDropzoneProps {
  value: MultiImageValue;
  onChange: (images: MultiImageValue) => void;
}

const isFile = (item: File | string): item is File => item instanceof File;

const MultiImageDropzone: React.FC<MultiImageDropzoneProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange([...value, ...acceptedFiles]);
    },
    [value, onChange]
  );

  const removeImage = (idx: number) => {
    const newImages = value.filter((_, i) => i !== idx);
    onChange(newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    multiple: true,
  });

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${isDragActive ? 'bg-accent' : 'bg-background'}`}
      >
        <input {...getInputProps()} />
        <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground mb-2">
          <UploadIcon size={20} />
        </div>
        {isDragActive ? (
          <p className="font-medium text-sm">{t('dropImages')}</p>
        ) : (
          <>
            <p className="font-medium text-sm">{t('uploadImages', 'Upload images')}</p>
            <p className="text-xs text-muted-foreground">
              {t('dragDropOrClick', 'Drag and drop or click to upload')}
            </p>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((item, idx) => (
          <div key={idx} className="relative">
            <img
              src={isFile(item) ? URL.createObjectURL(item) : item}
              alt={`preview-${idx}`}
              className="w-20 h-20 object-cover rounded"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0"
              onClick={() => removeImage(idx)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiImageDropzone;

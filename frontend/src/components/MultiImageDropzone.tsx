import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';

// Accepts both File (new uploads) and string (existing image URLs)
export type MultiImageValue = (File | string)[];

interface MultiImageDropzoneProps {
  value: MultiImageValue;
  onChange: (images: MultiImageValue) => void;
}

const isFile = (item: File | string): item is File => item instanceof File;

const MultiImageDropzone: React.FC<MultiImageDropzoneProps> = ({ value, onChange }) => {
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
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${isDragActive ? 'bg-accent' : 'bg-background'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the images here ...</p>
        ) : (
          <p>Drag & drop images here, or click to select files</p>
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

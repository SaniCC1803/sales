import { useCallback } from 'react';

export function useToast() {
  const toast = useCallback(
    ({
      title,
      description,
      variant,
      position = 'top-right',
    }: {
      title: string;
      description?: string;
      variant?: 'destructive' | 'default';
      position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'bottom-center';
    }) => {
      const toastEl = document.createElement('div');
      toastEl.innerHTML = `<div class='${variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-background text-foreground'} px-4 py-2 rounded shadow'>
      <strong>${title}</strong><div>${description ?? ''}</div>
    </div>`;
      let positionClass = 'top-4 right-4';
      if (position === 'bottom-right') positionClass = 'bottom-4 right-4';
      if (position === 'top-left') positionClass = 'top-4 left-4';
      if (position === 'bottom-left') positionClass = 'bottom-4 left-4';
      if (position === 'bottom-center') positionClass = 'bottom-4 left-1/2 transform -translate-x-1/2';
      toastEl.className = `fixed ${positionClass} z-[9999] animate-fade-in`;
      document.body.appendChild(toastEl);
      setTimeout(() => {
        toastEl.classList.add('animate-fade-out');
        setTimeout(() => document.body.removeChild(toastEl), 500);
      }, 3000);
    },
    []
  );
  return { toast };
}

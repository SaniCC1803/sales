import { useCallback } from 'react';

export function useToast() {
  const toast = useCallback(
    ({
      title,
      description,
      variant,
    }: {
      title: string;
      description?: string;
      variant?: 'destructive' | 'default';
    }) => {
      const toastEl = document.createElement('div');
      toastEl.innerHTML = `<div class='${variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-background text-foreground'} px-4 py-2 rounded shadow'>
      <strong>${title}</strong><div>${description ?? ''}</div>
    </div>`;
      toastEl.className = 'fixed top-4 right-4 z-[9999] animate-fade-in';
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

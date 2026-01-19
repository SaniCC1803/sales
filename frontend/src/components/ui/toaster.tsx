import * as React from 'react';
import { ToastProvider, ToastViewport } from '@radix-ui/react-toast';

export function Toaster() {
  return (
    <ToastProvider swipeDirection="right">
      <ToastViewport className="fixed top-4 right-4 z-50" />
    </ToastProvider>
  );
}

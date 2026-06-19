'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

interface ToastProviderProps {
  children: ReactNode;
}

const styles: Record<ToastVariant, string> = {
  info: 'border-cyan/30 bg-cyan/10 text-cyan',
  success: 'border-green-400/30 bg-green-400/10 text-green-400',
  warning: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400',
  error: 'border-crimson/30 bg-crimson/10 text-crimson',
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, variant = 'info', duration = 5000 }: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const toast: Toast = { id, title, description, variant, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

  const portal = mounted
    ? createPortal(
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'relative w-[320px] max-w-[calc(100vw-3rem)] rounded border p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all',
                styles[toast.variant || 'info']
              )}
            >
              <div className="pr-6">
                <p className="font-heading text-sm font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-xs opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="absolute right-2 top-2 rounded p-1 opacity-70 hover:opacity-100"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portal}
    </ToastContext.Provider>
  );
}

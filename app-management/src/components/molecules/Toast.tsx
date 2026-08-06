'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Icon } from '../atoms/Icon';

export type ToastVariant = 'success' | 'error';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastProps {
  toast: ToastMessage;
  onRemove: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isRendered, setIsRendered] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsRendered(false);
      onRemove();
    }, 300);
  }, [onRemove]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [handleClose]);

  if (!isRendered) {
    return null;
  }

  const isSuccess = toast.variant === 'success';

  return (
    <div
      className={`pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start rounded-xl border p-4 shadow-lg transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      } ${isSuccess ? 'border-success/20 bg-surface' : 'border-error/20 bg-surface'}`}
      role="alert"
    >
      <div className={`mr-3 mt-0.5 flex-shrink-0 ${isSuccess ? 'text-success' : 'text-error'}`}>
        <Icon name={isSuccess ? 'CheckCircle' : 'AlertTriangle'} size={20} />
      </div>
      <div className="mr-2 flex-1 text-sm font-medium text-text">{toast.message}</div>
      <button
        type="button"
        onClick={handleClose}
        className="ml-auto flex-shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-muted/10 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Close notification"
      >
        <Icon name="X" size={16} />
      </button>
    </div>
  );
};

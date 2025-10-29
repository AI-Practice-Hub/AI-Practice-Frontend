"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * Wrapper for all context providers
 * Add new providers here as needed
 */
export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

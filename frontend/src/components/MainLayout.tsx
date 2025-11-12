"use client";

import React from 'react';
import { MainSidebar } from './MainSidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { open, toggle } = useSidebar();

  return (
    <ProtectedRoute>
      <div className="flex h-screen min-h-0 relative bg-background">
        {/* Mobile Sidebar Overlay */}
        {open && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={toggle}
          />
        )}

        {/* Sidebar */}
        <MainSidebar open={open} onToggle={toggle} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
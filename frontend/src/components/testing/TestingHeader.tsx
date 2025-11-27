"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { NotificationBell } from '@/components/ui/NotificationBell';

interface TestingHeaderProps {
  projectId: number;
  projectName?: string;
  chatTitle?: string;
  onBack: () => void;
}

export function TestingHeader({ projectId, projectName, chatTitle, onBack }: TestingHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Button>

          <div className="h-6 w-px bg-border"></div>

          <div className="flex items-center gap-2">
            <FolderOpen size={20} className="text-muted-foreground" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">{chatTitle || 'Testing Studio'}</h1>
              <p className="text-sm text-muted-foreground">{projectName || `Project #${projectId}`}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            AI-Powered Test Generation
          </div>
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
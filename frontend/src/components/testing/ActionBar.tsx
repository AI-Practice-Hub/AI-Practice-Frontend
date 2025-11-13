"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw, FileText, Share, Download } from 'lucide-react';

interface ActionBarProps {
  hasResponses: boolean;
  isProcessing: boolean;
  onNewSession: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

export function ActionBar({
  hasResponses,
  isProcessing,
  onNewSession,
  onSave,
  onExport,
  onShare
}: ActionBarProps) {
  if (!hasResponses && !isProcessing) {
    return null; // Don't show action bar if no content yet
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onNewSession}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <RotateCcw size={16} />
            New Session
          </Button>

          {hasResponses && (
            <Button
              variant="outline"
              onClick={onSave}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              Save Draft
            </Button>
          )}
        </div>

        {hasResponses && (
          <>
            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onExport}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </Button>

              <Button
                variant="outline"
                onClick={onShare}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Share size={16} />
                Share
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
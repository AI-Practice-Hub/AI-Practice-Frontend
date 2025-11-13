"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export function FileUploadZone({
  onFilesSelected,
  disabled = false,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.csv']
}: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
    setDragActive(false);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxFiles,
    maxSize,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <Card
      {...getRootProps()}
      className={`
        border-2 border-dashed transition-colors cursor-pointer
        ${disabled
          ? 'border-muted bg-muted/50 cursor-not-allowed'
          : isDragActive || dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted hover:border-primary/50 hover:bg-muted/50'
        }
      `}
    >
      <input {...getInputProps()} />

      <div className="p-6 text-center">
        <Upload
          size={48}
          className={`mx-auto mb-4 ${
            disabled ? 'text-muted-foreground' : 'text-muted-foreground'
          }`}
        />

        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {disabled ? 'Upload Disabled' : 'Upload Requirements'}
          </h3>

          <p className="text-sm text-muted-foreground">
            {disabled
              ? 'File upload is currently disabled'
              : 'Drag & drop files here, or click to browse'
            }
          </p>

          {!disabled && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Supported formats: {acceptedTypes.join(', ')}</p>
              <p>Maximum {maxFiles} files, up to {(maxSize / 1024 / 1024).toFixed(0)}MB each</p>
            </div>
          )}
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            Browse Files
          </Button>
        )}
      </div>
    </Card>
  );
}
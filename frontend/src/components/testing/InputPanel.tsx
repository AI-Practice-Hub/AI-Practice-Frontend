"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { FileUploadZone } from './FileUploadZone';
import { Upload, FileText, Send } from 'lucide-react';

interface InputPanelProps {
  onSubmit: (input: { text?: string; files?: File[] }) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export function InputPanel({ onSubmit, isProcessing, disabled = false }: InputPanelProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = useCallback(() => {
    if (disabled || isProcessing || (!text.trim() && files.length === 0)) return;

    onSubmit({
      text: text.trim() || undefined,
      files: files.length > 0 ? files : undefined,
    });
  }, [text, files, onSubmit, disabled, isProcessing]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const canSubmit = !disabled && !isProcessing && (text.trim() || files.length > 0);

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            Input Requirements
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload your requirements documents and describe what you want to test
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* File Upload Zone */}
          <div className="flex-shrink-0">
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              disabled={disabled || isProcessing}
            />
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="flex-shrink-0">
              <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-muted-foreground" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    {!disabled && !isProcessing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Input */}
          <div className="flex-1 flex flex-col min-h-0">
            <label className="text-sm font-medium mb-2 flex-shrink-0">
              Testing Requirements
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your testing requirements, user stories, or acceptance criteria..."
              className="flex-1 min-h-[200px] resize-none"
              disabled={disabled || isProcessing}
            />
            <div className="flex justify-between items-center mt-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {text.length} characters
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full flex items-center gap-2"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Analyzing Requirements...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Start Testing
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
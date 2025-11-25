"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface UrlTestingModalProps {
  projectId: number;
  open: boolean;
  onClose: () => void;
}

export function UrlTestingModal({ projectId, open, onClose }: UrlTestingModalProps) {
  const router = useRouter();
  const [sessionName, setSessionName] = useState('');
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(1);
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (u: string) => {
    try {
      // Will throw on invalid URL
      // eslint-disable-next-line no-new
      new URL(u);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleStartExplore = async () => {
    setError(null);
    if (!sessionName.trim() || !url.trim()) {
      setError("Session name and URL are required");
      return;
    }
    
    if (!validateUrl(url.trim())) {
      setError("Invalid URL. Please include http:// or https://");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create chat for this testing session
      const chatResponse = await api.post('/chat/', {
        project_id: projectId,
        title: sessionName.trim(),
      });

      const newChat = chatResponse.data;

      // Call explore endpoint
      await api.post('/discovery/explore', {
        url: url.trim(),
        max_pages: maxPages,
        project_id: projectId.toString(),
        chat_id: newChat.id.toString(),
        suggestion: suggestions || undefined,
      });

      // Close and navigate to test-cases page
      onClose();
      router.push(`/dashboard/projects/${projectId}/test-cases?chatId=${newChat.id}`);
    } catch (error) {
      console.error('Failed to start URL exploration', error);
      setError("Failed to start exploration. Please check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSessionName('');
    setUrl('');
    setMaxPages(1);
    setSuggestions('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>URL-based Testing</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <div>
            <Label htmlFor="url-session-name">Session Name</Label>
            <Input
              id="url-session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Give a name for this session"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="url-input">URL</Label>
            <Input
              id="url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="max-pages">Max pages</Label>
            <Input
              id="max-pages"
              type="number"
              value={maxPages}
              onChange={(e) => setMaxPages(Math.max(1, Math.min(20, parseInt(e.target.value || '1', 10))))}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="suggestions">Suggestions (optional)</Label>
            <Textarea
              id="suggestions"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              rows={3}
              placeholder="Provide any suggestions for the site exploration"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleStartExplore} disabled={isSubmitting || !sessionName.trim() || !url.trim()}>
            {isSubmitting ? 'Starting...' : 'Start Test Discovery'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UrlTestingModal;

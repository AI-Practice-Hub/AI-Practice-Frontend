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
    if (!sessionName.trim() || !url.trim()) return;
    if (!validateUrl(url.trim())) return;

    setIsSubmitting(true);
    try {
      // Create chat for this testing session
      const chatResponse = await api.post('/chat/', {
        project_id: projectId,
        title: sessionName.trim(),
      });

      const newChat = chatResponse.data;

      // Call explore endpoint
      await api.post('/page/explore', {
        url: url.trim(),
        max_pages: maxPages,
        project_id: projectId,
        chat_id: newChat.id,
        suggestion: suggestions || undefined,
      });

      // Close and navigate to testing page
      onClose();
      router.push(`/dashboard/projects/${projectId}/testing?chatId=${newChat.id}`);
    } catch (error) {
      console.error('Failed to start URL exploration', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSessionName('');
    setUrl('');
    setMaxPages(1);
    setSuggestions('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>URL-based Testing</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            {isSubmitting ? 'Starting...' : 'Start URL Test'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UrlTestingModal;

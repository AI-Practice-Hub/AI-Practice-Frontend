"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { useProject } from '@/hooks/useProject';
import { api } from '@/lib/api';

interface TestingSessionModalProps {
  projectId: number;
  open: boolean;
  onClose: () => void;
}

export function TestingSessionModal({ projectId, open, onClose }: TestingSessionModalProps) {
  const router = useRouter();
  const { createProject } = useProject(); // We'll use this for validation
  const [sessionName, setSessionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    if (!sessionName.trim()) return;

    setIsCreating(true);
    try {
      // Create a new chat for this testing session
      const chatData = {
        project_id: projectId,
        title: sessionName.trim()
      };

      const response = await api.post('/chat/', chatData);
      const newChat = response.data;

      // Close modal and redirect to testing studio with the new chat
      onClose();
      router.push(`/dashboard/projects/${projectId}/testing?chatId=${newChat.id}`);

    } catch (error) {
      console.error('Failed to create testing session:', error);
      // TODO: Add error handling/toast
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSessionName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Testing Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="session-name">Session Name</Label>
            <Input
              id="session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter a name for your testing session"
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && sessionName.trim()) {
                  handleCreateSession();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateSession}
            disabled={!sessionName.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Start Testing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
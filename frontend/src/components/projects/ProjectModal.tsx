"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  formData: {
    name: string;
    description: string;
    jira_project_id: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    jira_project_id: string;
  }>>;
  isSubmitting: boolean;
  submitLabel?: string;
}

export function ProjectModal({
  open,
  onClose,
  onSubmit,
  title,
  formData,
  setFormData,
  isSubmitting,
  submitLabel = 'Submit'
}: ProjectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter project description (optional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="jira-project-id">Jira Project ID</Label>
            <Input
              id="jira-project-id"
              value={formData.jira_project_id}
              onChange={(e) => setFormData(prev => ({ ...prev, jira_project_id: e.target.value }))}
              placeholder="e.g., PROJ, TEST (optional)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the Jira project key to link this project with Jira
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={!formData.name.trim() || isSubmitting}
          >
            {isSubmitting ? `${submitLabel}...` : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { TestTube, MessageCircle, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const handleStartTesting = () => {
    router.push(`/dashboard/projects/${project.id}/testing`);
  };

  const handleOpenChat = () => {
    router.push(`/chat?projectId=${project.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate" title={project.name}>
              {project.name}
            </CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2" title={project.description}>
                {project.description}
              </p>
            )}
          </div>
          <Badge variant="outline" className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Meta */}
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar size={12} className="mr-1" />
          Created {project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : 'Unknown'}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleStartTesting}
            className="flex-1 flex items-center gap-2 bg-blue-500 text-white border border-blue-500"
            variant="default"
          >
            Start Testing
          </Button>
          <Button
            onClick={handleOpenChat}
            variant="outline"
            className="flex items-center gap-2"
          >
            <MessageCircle size={14} />
            Chat
          </Button>
        </div>

        {/* Future: Add stats like number of test sessions, chats, etc. */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Test Sessions</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Chats</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
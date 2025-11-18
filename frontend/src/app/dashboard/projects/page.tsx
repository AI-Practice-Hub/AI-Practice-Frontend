"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useProject } from '@/hooks/useProject';
import { Project } from '@/types/project';
import { MessageCircle, Plus, TestTube, Globe } from 'lucide-react';
import UrlTestingModal from '@/components/testing/UrlTestingModal';
import { TestingSessionModal } from '@/components/testing/TestingSessionModal';

export default function ProjectsPage() {
  const { getProjects, createProject, loading, error } = useProject();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [testingModalProjectId, setTestingModalProjectId] = useState<number | null>(null);
  const [urlTestingModalProjectId, setUrlTestingModalProjectId] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    fetchProjects();
  }, [getProjects]);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    setIsCreating(true);
    try {
      const createdProject = await createProject({
        name: newProject.name.trim(),
        description: newProject.description.trim() || undefined,
        status: 'active',
      });
      
      setProjects(prev => [createdProject, ...prev]);
      setNewProject({ name: '', description: '' });
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">Loading projects...</div>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your testing projects</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="relative">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description || 'No description'}
                </p>
                <p className="text-sm font-medium mb-4">
                  Status: <span className="capitalize">{project.status}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    className="flex-1 bg-blue-500 text-white border border-blue-500"
                    onClick={() => setTestingModalProjectId(project.id)}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Quick Test
                  </Button>
                  <Button
                    className="flex-1 bg-blue-500 text-white border border-blue-500"
                    onClick={() => setUrlTestingModalProjectId(project.id)}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    URL Test
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => router.push(`/dashboard/projects/${project.id}/sessions`)}>
                    View Details
                  </Button>
                  <Link href={`/chat?projectId=${project.id}`}>
                    <Button variant="outline" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
                disabled={isCreating}
              />
            </div>
            <div>
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter project description (optional)"
                rows={3}
                disabled={isCreating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              disabled={!newProject.name.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testing Session Modal */}
      <TestingSessionModal
        projectId={testingModalProjectId || 0}
        open={testingModalProjectId !== null}
        onClose={() => setTestingModalProjectId(null)}
      />

      {/* URL Testing Modal */}
      <UrlTestingModal
        projectId={urlTestingModalProjectId || 0}
        open={urlTestingModalProjectId !== null}
        onClose={() => setUrlTestingModalProjectId(null)}
      />
    </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { useProject } from '@/hooks/useProject';
import { Project } from '@/types/project';
import { MessageCircle, Plus, TestTube, Globe, Settings, Trash2 } from 'lucide-react';
import UrlTestingModal from '@/components/testing/UrlTestingModal';
import { TestingSessionModal } from '@/components/testing/TestingSessionModal';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { useToast } from '@/hooks/useToast';

export default function ProjectsPage() {
  const { getProjects, createProject, updateProject, deleteProject, loading, error } = useProject();
  const toast = useToast();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [testingModalProjectId, setTestingModalProjectId] = useState<number | null>(null);
  const [urlTestingModalProjectId, setUrlTestingModalProjectId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    jira_project_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const createdProject = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: 'active',
        jira_project_id: formData.jira_project_id.trim() || undefined,
      });
      
      setProjects(prev => [createdProject, ...prev]);
      setFormData({ name: '', description: '', jira_project_id: '' });
      setIsCreateModalOpen(false);
      toast.success('Project created successfully');
    } catch (err) {
      console.error('Failed to create project:', err);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      jira_project_id: project.jira_project_id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const updatedProject = await updateProject(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: editingProject.status,
        jira_project_id: formData.jira_project_id.trim() || undefined,
      });
      
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      setIsEditModalOpen(false);
      setEditingProject(null);
      toast.success('Project updated successfully');
    } catch (err) {
      console.error('Failed to update project:', err);
      toast.error('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: number, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project');
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
                  <div className="flex justify-between items-start">
                    <CardTitle>{project.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(project)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {project.description || 'No description'}
                  </p>
                  <p className="text-sm font-medium mb-4">
                    Status: <span className="capitalize">{project.status}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      className="bg-blue-500 text-white border border-blue-500"
                      onClick={() => setTestingModalProjectId(project.id)}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Quick Test
                    </Button>
                    <Button
                      className="bg-blue-500 text-white border border-blue-500"
                      onClick={() => setUrlTestingModalProjectId(project.id)}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      AI Test Discovery
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/dashboard/projects/${project.id}/sessions`)}>
                      View Details
                    </Button>
                    <Link href={`/chat?projectId=${project.id}`} className="block w-full">
                      <Button variant="outline" className="w-full">
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
      <ProjectModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        title="Create New Project"
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        submitLabel="Create Project"
      />

      {/* Edit Project Modal */}
      <ProjectModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleUpdateProject}
        title="Edit Project"
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        submitLabel="Update Project"
      />

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
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project';

export function useProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = useCallback(async (data: CreateProjectRequest): Promise<Project> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<Project>('/projects', data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create project';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjects = useCallback(async (): Promise<Project[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Project[]>('/projects');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch projects';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback(async (id: number): Promise<Project> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch project';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: number, data: UpdateProjectRequest): Promise<Project> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put<Project>(`/projects/${id}`, data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to update project';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/projects/${id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete project';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    loading,
    error,
  };
}
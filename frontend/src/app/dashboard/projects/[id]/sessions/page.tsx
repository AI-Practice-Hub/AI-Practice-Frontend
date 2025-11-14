"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, Calendar, Play, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { TestingSessionModal } from '@/components/testing/TestingSessionModal';

interface ChatSession {
  id: number;
  title: string;
  project_id: number;
  created_at: string;
  updated_at?: string;
}

export default function ProjectSessionsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  useEffect(() => {
    loadSessions();
    loadProjectDetails();
  }, [projectId]);

  const loadSessions = async () => {
    try {
      const response = await api.get(`/chat/?project_id=${projectId}`);
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setProjectName(response.data.name);
    } catch (error) {
      console.error('Failed to load project details:', error);
    }
  };

  const handleBackToProjects = () => {
    router.push('/dashboard/projects');
  };

  const handleResumeSession = (chatId: number) => {
    router.push(`/dashboard/projects/${projectId}/testing?chatId=${chatId}`);
  };

  const handleViewTestCases = (chatId: number) => {
    router.push(`/dashboard/projects/${projectId}/test-cases?chatId=${chatId}`);
  };

  const handleDeleteSession = async (chatId: number) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/chat/${chatId}`);
      setSessions(prev => prev.filter(session => session.id !== chatId));
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  const handleNewSessionCreated = () => {
    loadSessions(); // Refresh the sessions list
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToProjects}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {projectName ? `${projectName} - ` : ''}Testing Sessions
              </h1>
              <p className="text-muted-foreground">View and manage your testing sessions</p>
            </div>
          </div>
          <Button
            onClick={() => setIsNewSessionModalOpen(true)}
            className="bg-blue-500 text-white"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Testing Sessions</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't created any testing sessions for this project yet.
              </p>
              <Button onClick={() => setIsNewSessionModalOpen(true)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {sessions.filter(s => new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {sessions.filter(s => new Date(s.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Today</p>
                </CardContent>
              </Card>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created: {formatDate(session.created_at)}
                          </div>
                          {session.updated_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Updated: {formatDate(session.updated_at)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        Session #{session.id}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => handleResumeSession(session.id)}
                        className="bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume Chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTestCases(session.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Test Cases
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Session Modal */}
      <TestingSessionModal
        projectId={projectId}
        open={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
      />
    </div>
  );
}
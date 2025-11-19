"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { useProject } from '@/hooks/useProject';
import { api } from '@/lib/api';
import { FolderOpen, MessageCircle, TestTube, Users } from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  totalChats: number;
  completedTests: number;
  teamMembers: number;
}

export default function DashboardPage() {
  const { getProjects } = useProject();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalChats: 0,
    completedTests: 0,
    teamMembers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch projects
        const projects = await getProjects();
        const totalProjects = projects.length;

        // Fetch all chats
        const chatsResponse = await api.get('/chat/');
        const totalChats = chatsResponse.data.length;

        // For now, keep completed tests and team members as static
        // These could be added to backend later
        setStats({
          totalProjects,
          totalChats,
          completedTests: 0, // TODO: Add to backend
          teamMembers: 1, // Current user
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getProjects]);

  const statCards = [
    {
      title: "Total Projects",
      value: loading ? "..." : stats.totalProjects.toString(),
      change: "Active projects",
      icon: FolderOpen,
      color: "text-blue-600"
    },
    {
      title: "Total Chats",
      value: loading ? "..." : stats.totalChats.toString(),
      change: "Conversations started",
      icon: MessageCircle,
      color: "text-green-600"
    },
    {
      title: "Completed Tests",
      value: loading ? "..." : stats.completedTests.toString(),
      change: "Tests executed",
      icon: TestTube,
      color: "text-purple-600"
    },
    {
      title: "Team Members",
      value: loading ? "..." : stats.teamMembers.toString(),
      change: "Active users",
      icon: Users,
      color: "text-orange-600"
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your TestSamurAi dashboard</p>
        </div>
        <Link href="/dashboard/projects">
          <Button className="flex items-center gap-2">
            <FolderOpen size={16} />
            View Projects
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity to display.</p>
        </CardContent>
      </Card>
    </div>
  );
}
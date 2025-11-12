"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

export default function ProjectsPage() {
  // Dummy data for projects
  const projects = [
    { id: 1, name: "E-commerce Testing", description: "Automated testing for online store", status: "Active" },
    { id: 2, name: "API Validation", description: "Backend API testing suite", status: "Completed" },
    { id: 3, name: "UI Component Tests", description: "Frontend component testing", status: "In Progress" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your testing projects</p>
        </div>
        <Button>New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
              <p className="text-sm font-medium">Status: {project.status}</p>
              <Button variant="outline" className="mt-4">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  // Dummy data for reports
  const reports = [
    { id: 1, name: "Test Report 1", status: "Completed", date: "2025-11-10" },
    { id: 2, name: "Test Report 2", status: "In Progress", date: "2025-11-09" },
    { id: 3, name: "Test Report 3", status: "Pending", date: "2025-11-08" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">View and manage your test reports</p>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>{report.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Status: {report.status}</p>
              <p className="text-sm text-muted-foreground">Date: {report.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
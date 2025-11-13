"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface TestCase {
  test_case_id: string;
  title: string;
  module_feature: string;
  priority: 'High' | 'Medium' | 'Low';
  preconditions: string;
  test_steps: string;
  test_data: string;
  expected_result: string;
  actual_result?: string;
  status: 'Pass' | 'Fail' | 'Pending';
}

export default function TestCasesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = parseInt(params.id as string);
  const chatId = searchParams.get('chatId');

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (chatId) {
      loadTestCases();
    }
  }, [chatId]);

  const loadTestCases = async () => {
    try {
      // Get test cases directly from the dedicated API
      const response = await api.get(`/chat/${chatId}/test-cases`);
      setTestCases(response.data);
    } catch (error) {
      console.error('Failed to load test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTesting = () => {
    router.push(`/dashboard/projects/${projectId}/testing?chatId=${chatId}`);
  };

  const handleBackToProjects = () => {
    router.push('/dashboard/projects');
  };

  const toggleTestCaseSelection = (testCaseId: string) => {
    const newSelected = new Set(selectedCases);
    if (newSelected.has(testCaseId)) {
      newSelected.delete(testCaseId);
    } else {
      newSelected.add(testCaseId);
    }
    setSelectedCases(newSelected);
  };

  const handleExecuteSelected = async () => {
    if (selectedCases.size === 0) return;

    setExecuting(true);
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update test case statuses
      setTestCases(prev => prev.map(tc => {
        if (selectedCases.has(tc.test_case_id)) {
          return {
            ...tc,
            status: Math.random() > 0.3 ? 'Pass' : 'Fail' as const,
            actual_result: `Test executed on ${new Date().toLocaleDateString()}`
          };
        }
        return tc;
      }));

      setSelectedCases(new Set());
    } catch (error) {
      console.error('Failed to execute tests:', error);
    } finally {
      setExecuting(false);
    }
  };

  const handleExport = () => {
    // Simple export as JSON for now
    const dataStr = JSON.stringify(testCases, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `test-cases-${projectId}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Play className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading test cases...</p>
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
            <Button variant="ghost" size="sm" onClick={handleBackToTesting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Testing
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Test Cases</h1>
              <p className="text-muted-foreground">Review and execute generated test cases</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleExecuteSelected}
              disabled={selectedCases.size === 0 || executing}
            >
              <Play className="w-4 h-4 mr-2" />
              {executing ? 'Executing...' : `Execute Selected (${selectedCases.size})`}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {testCases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Test Cases Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Test cases could not be loaded. Please go back to testing and try again.
              </p>
              <Button onClick={handleBackToTesting}>
                Back to Testing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-foreground">{testCases.length}</div>
                  <p className="text-xs text-muted-foreground">Total Test Cases</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {testCases.filter(tc => tc.status === 'Pass').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Passed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {testCases.filter(tc => tc.status === 'Fail').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-600">
                    {testCases.filter(tc => tc.status === 'Pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
            </div>

            {/* Test Cases List */}
            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <Card key={testCase.test_case_id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedCases.has(testCase.test_case_id)}
                            onChange={() => toggleTestCaseSelection(testCase.test_case_id)}
                            className="rounded border-gray-300"
                          />
                          <CardTitle className="text-lg">{testCase.title}</CardTitle>
                          {getStatusIcon(testCase.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getPriorityColor(testCase.priority)}>
                            {testCase.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {testCase.module_feature}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Preconditions */}
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Preconditions:</h4>
                      <p className="text-sm text-muted-foreground">{testCase.preconditions}</p>
                    </div>

                    {/* Test Steps */}
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Test Steps:</h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {testCase.test_steps}
                      </div>
                    </div>

                    {/* Test Data */}
                    {testCase.test_data && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Test Data:</h4>
                        <p className="text-sm text-muted-foreground">{testCase.test_data}</p>
                      </div>
                    )}

                    {/* Expected Result */}
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Expected Result:</h4>
                      <p className="text-sm text-muted-foreground">{testCase.expected_result}</p>
                    </div>

                    {/* Actual Result */}
                    {testCase.actual_result && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Actual Result:</h4>
                        <p className="text-sm text-muted-foreground">{testCase.actual_result}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
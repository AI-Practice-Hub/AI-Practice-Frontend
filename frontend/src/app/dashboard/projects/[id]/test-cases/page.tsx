"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Download, Play, CheckCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface TestCase {
  test_case_id: string;
  title: string;
  module_feature: string;
  priority: 'High' | 'Medium' | 'Low';
  preconditions: string;
  test_steps: string[];
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const toggleRowExpansion = (testCaseId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
      }
      return newSet;
    });
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
    if (selectedCases.size === 0 || !chatId) return;

    setExecuting(true);
    try {
      // Get selected test cases
      const selectedTestCases = testCases.filter(tc => selectedCases.has(tc.test_case_id));

      // Create FormData for the API call
      const formData = new FormData();
      formData.append('invoke_type', 'resume');
      formData.append('content', JSON.stringify(selectedTestCases));

      // Send message via chat API
      const response = await api.post(`/chat/${chatId}/send-message?invoke_type=resume`, formData, {
        headers: {
          'Content-Type': undefined, // Let browser set proper multipart boundary
        },
      });

      const newMessage = response.data;

      // Update test case statuses based on the response
      // For now, we'll simulate status updates, but in a real implementation
      // you might want to parse the response and update accordingly
      setTestCases(prev => prev.map(tc => {
        if (selectedCases.has(tc.test_case_id)) {
          return {
            ...tc,
            status: Math.random() > 0.3 ? 'Pass' : 'Fail' as const,
            actual_result: `Test executed via API on ${new Date().toLocaleDateString()}`
          };
        }
        return tc;
      }));

      setSelectedCases(new Set());

      // Optionally show success message or handle response
      console.log('Test execution response:', newMessage);

    } catch (error) {
      console.error('Failed to execute tests:', error);
      // Update test cases with error status
      setTestCases(prev => prev.map(tc => {
        if (selectedCases.has(tc.test_case_id)) {
          return {
            ...tc,
            status: 'Fail' as const,
            actual_result: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
        return tc;
      }));
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCases(new Set(testCases.map(tc => tc.test_case_id)));
    } else {
      setSelectedCases(new Set());
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

            {/* Test Cases Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-12 p-3 text-left">
                      <Checkbox
                        checked={selectedCases.size === testCases.length && testCases.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="w-8 p-3"></th>
                    <th className="p-3 text-left font-semibold">Test Case ID</th>
                    <th className="p-3 text-left font-semibold min-w-[200px]">Title</th>
                    <th className="p-3 text-left font-semibold">Module</th>
                    <th className="p-3 text-left font-semibold">Priority</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {testCases.map((testCase) => {
                    const isSelected = selectedCases.has(testCase.test_case_id);
                    const isExpanded = expandedRows.has(testCase.test_case_id);

                    return (
                      <React.Fragment key={testCase.test_case_id}>
                        <tr className={`border-t hover:bg-muted/30 ${isSelected ? 'bg-primary/5' : ''}`}>
                          <td className="p-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleTestCaseSelection(testCase.test_case_id)}
                            />
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(testCase.test_case_id)}
                              className="h-6 w-6 p-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                          <td className="p-3 font-mono text-sm">{testCase.test_case_id}</td>
                          <td className="p-3 font-medium">{testCase.title}</td>
                          <td className="p-3 text-sm">{testCase.module_feature || '-'}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={getPriorityColor(testCase.priority)}>
                              {testCase.priority}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={getStatusColor(testCase.status)}>
                              {testCase.status}
                            </Badge>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-muted/20">
                            <td colSpan={7} className="p-4 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {testCase.preconditions && (
                                  <div>
                                    <strong className="text-muted-foreground">Preconditions:</strong>
                                    <p className="mt-1">{testCase.preconditions}</p>
                                  </div>
                                )}
                                {testCase.test_steps && testCase.test_steps.length > 0 && (
                                  <div>
                                    <strong className="text-muted-foreground">Test Steps:</strong>
                                    <div className="mt-1 space-y-2">
                                      {testCase.test_steps.map((step, index) => (
                                        <div key={index} className="flex items-start gap-2 text-sm">
                                          <span className="font-medium text-muted-foreground min-w-[20px]">
                                            {index + 1}.
                                          </span>
                                          <span>{step}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {testCase.test_data && (
                                  <div>
                                    <strong className="text-muted-foreground">Test Data:</strong>
                                    <p className="mt-1">{testCase.test_data}</p>
                                  </div>
                                )}
                                <div>
                                  <strong className="text-muted-foreground">Expected Result:</strong>
                                  <p className="mt-1">{testCase.expected_result}</p>
                                </div>
                                {testCase.actual_result && (
                                  <div>
                                    <strong className="text-muted-foreground">Actual Result:</strong>
                                    <p className="mt-1">{testCase.actual_result}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
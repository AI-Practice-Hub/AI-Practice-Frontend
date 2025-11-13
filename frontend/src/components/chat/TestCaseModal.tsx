"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TestCase } from '@/types/chat';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';

interface TestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  testCases: TestCase[];
  onSubmit: (selectedTestCases: TestCase[]) => void;
  isLoading?: boolean;
}

export function TestCaseModal({
  isOpen,
  onClose,
  testCases,
  onSubmit,
  isLoading = false
}: TestCaseModalProps) {
  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleSelection = (testCase: TestCase) => {
    setSelectedTestCases(prev => {
      const isSelected = prev.some(tc => tc.test_case_id === testCase.test_case_id);
      if (isSelected) {
        return prev.filter(tc => tc.test_case_id !== testCase.test_case_id);
      } else {
        return [...prev, testCase];
      }
    });
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

  const handleSelectAll = () => {
    if (selectedTestCases.length === testCases.length) {
      setSelectedTestCases([]);
    } else {
      setSelectedTestCases([...testCases]);
    }
  };

  const handleSubmit = () => {
    if (selectedTestCases.length > 0) {
      onSubmit(selectedTestCases);
      setSelectedTestCases([]);
      setExpandedRows(new Set());
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedTestCases([]);
    setExpandedRows(new Set());
    onClose();
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
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Test Case Selection</DialogTitle>
          <DialogDescription>
            Review and select test cases for execution. Expand rows for detailed information.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-12 p-3 text-left">
                    <Checkbox
                      checked={selectedTestCases.length === testCases.length && testCases.length > 0}
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
                  const isSelected = selectedTestCases.some(tc => tc.test_case_id === testCase.test_case_id);
                  const isExpanded = expandedRows.has(testCase.test_case_id);

                  return (
                    <React.Fragment key={testCase.test_case_id}>
                      <tr className={`border-t hover:bg-muted/30 ${isSelected ? 'bg-primary/5' : ''}`}>
                        <td className="p-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(testCase)}
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
                        <tr className="bg-muted/20 relative z-20">
                          <td colSpan={7} className="p-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {testCase.preconditions && (
                                <div>
                                  <strong className="text-muted-foreground">Preconditions:</strong>
                                  <p className="mt-1">{testCase.preconditions}</p>
                                </div>
                              )}
                              {testCase.test_steps && (
                                <div>
                                  <strong className="text-muted-foreground">Test Steps:</strong>
                                  <div className="mt-1 whitespace-pre-line">{testCase.test_steps}</div>
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

        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="text-sm text-muted-foreground">
            {selectedTestCases.length} of {testCases.length} test cases selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedTestCases.length === 0 || isLoading}
            >
              {isLoading ? 'Submitting...' : `Execute ${selectedTestCases.length} Test Case${selectedTestCases.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
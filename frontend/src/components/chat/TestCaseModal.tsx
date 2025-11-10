"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { TestCase } from '@/types/chat';
import { Check } from 'lucide-react';

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

  const handleSubmit = () => {
    if (selectedTestCases.length > 0) {
      onSubmit(selectedTestCases);
      setSelectedTestCases([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedTestCases([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Test Cases</DialogTitle>
          <DialogDescription>
            Choose the test cases you want to execute. You can select multiple test cases.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-4 md:grid-cols-2">
            {testCases.map((testCase) => {
              const isSelected = selectedTestCases.some(tc => tc.test_case_id === testCase.test_case_id);

              return (
                <Card
                  key={testCase.test_case_id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => toggleSelection(testCase)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-semibold leading-tight">
                        {testCase.test_name}
                      </CardTitle>
                      {isSelected && (
                        <div className="flex-shrink-0 ml-2">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {testCase.description}
                    </p>
                    <div className="mt-3 text-xs text-muted-foreground font-medium">
                      ID: {testCase.test_case_id}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedTestCases.length} test case{selectedTestCases.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedTestCases.length === 0 || isLoading}
            >
              {isLoading ? 'Submitting...' : `Submit ${selectedTestCases.length} Test Case${selectedTestCases.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
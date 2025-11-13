"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, MessageSquare, TestTube } from 'lucide-react';
import { InputPanel } from '@/components/testing/InputPanel';
import { OutputPanel } from '@/components/testing/OutputPanel';
import { ActionBar } from '@/components/testing/ActionBar';
import { TestingHeader } from '@/components/testing/TestingHeader';

export default function TestingPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  // Testing session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);

  const handleBackToProjects = () => {
    router.push('/dashboard/projects');
  };

  const handleStartTesting = async (input: { text?: string; files?: File[] }) => {
    setIsProcessing(true);
    try {
      // TODO: Implement API call to start testing session
      // This will use the chat API with testing context
      console.log('Starting testing session with:', input);

      // For now, simulate a response
      setTimeout(() => {
        setResponses([{
          type: 'text',
          content: 'I\'ve received your requirements. Let me analyze them and generate comprehensive test cases.',
          timestamp: new Date().toISOString()
        }]);
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to start testing:', error);
      setIsProcessing(false);
    }
  };

  const handleSendFollowUp = async (message: string) => {
    setIsProcessing(true);
    try {
      // TODO: Implement follow-up message API call
      console.log('Sending follow-up:', message);

      // For now, simulate a response
      setTimeout(() => {
        setResponses(prev => [...prev, {
          type: 'text',
          content: `Thank you for the clarification. I'll update the test cases accordingly.`,
          timestamp: new Date().toISOString()
        }]);
        setIsProcessing(false);
      }, 1500);

    } catch (error) {
      console.error('Failed to send follow-up:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <TestingHeader
        projectId={projectId}
        onBack={handleBackToProjects}
      />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Input Panel */}
        <div className="w-full lg:w-1/2 p-6 border-r border-border">
          <InputPanel
            onSubmit={handleStartTesting}
            isProcessing={isProcessing}
            disabled={responses.length > 0}
          />
        </div>

        {/* Output Panel */}
        <div className="w-full lg:w-1/2 p-6">
          <OutputPanel
            responses={responses}
            isProcessing={isProcessing}
            onSendFollowUp={handleSendFollowUp}
          />
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        hasResponses={responses.length > 0}
        isProcessing={isProcessing}
        onNewSession={() => {
          setResponses([]);
          setSessionId(null);
        }}
      />
    </div>
  );
}
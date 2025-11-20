"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, MessageSquare, TestTube } from 'lucide-react';
import { InputPanel, InputPanelRef } from '@/components/testing/InputPanel';
import { OutputPanel } from '@/components/testing/OutputPanel';
import { TestingHeader } from '@/components/testing/TestingHeader';
import { api } from '@/lib/api';

export default function TestingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = parseInt(params.id as string);
  const chatId = searchParams.get('chatId');

  // Testing session state
  const [isProcessing, setIsProcessing] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>('');
  const [chatTitle, setChatTitle] = useState<string>('');
  const inputPanelRef = useRef<InputPanelRef>(null);

  // Load chat history and details on mount
  useEffect(() => {
    const loadData = async () => {
      if (chatId) {
        await loadChatDetails();
        await loadChatHistory();
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, [chatId]);

  const loadChatDetails = async () => {
    try {
      const response = await api.get(`/chat/${chatId}/details`);
      setChatTitle(response.data.chat_title);
      setProjectName(response.data.project_name);
    } catch (error) {
      console.error('Failed to load chat details:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`);
      const messages = response.data;

      // Filter to only include AI responses (bot messages), exclude user messages
      const aiMessages = messages.filter((msg: any) => msg.sender === 'bot');

      // Convert AI messages to response format
      const formattedResponses = aiMessages.map((msg: any) => ({
        id: msg.id,
        type: msg.sender === 'bot' ? 'ai' : 'user',
        content: msg.content,
        timestamp: msg.timestamp,
        invoke_type: msg.invoke_type,
        test_case: msg.test_case,
        files: msg.file_name ? [{
          name: msg.file_name,
          type: msg.file_type,
          url: msg.file_url
        }] : []
      }));

      setResponses(formattedResponses);

      // Check if last message has test cases - auto redirect
      // Test cases are returned when content is an array OR invoke_type is test-case-approval
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && (Array.isArray(lastMessage.content) || lastMessage.invoke_type === 'test-case-approval')) {
        router.push(`/dashboard/projects/${projectId}/test-cases?chatId=${chatId}`);
        return;
      }

    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToProjects = () => {
    router.push('/dashboard/projects');
  };

  const handleSubmit = async (input: { text?: string; files?: File[] }) => {
    if (responses.length === 0) {
      // Initial submission
      await handleStartTesting(input);
    } else {
      // Follow-up - send both text and files
      await handleSendFollowUp(input);
    }
  };

  const handleStartTesting = async (input: { text?: string; files?: File[] }) => {
    if (!chatId) return;

    setIsProcessing(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('invoke_type', 'new');
      if (input.text) {
        formData.append('content', input.text);
      }
      if (input.files && input.files.length > 0) {
        input.files.forEach((file, index) => {
          formData.append('files', file);
        });
      }

      // Send message via chat API
      const response = await api.post(`/chat/${chatId}/send-message?invoke_type=new`, formData, {
        headers: {
          'Content-Type': undefined, // Let browser set proper multipart boundary
        },
      });

      const newMessage = response.data;

      // Add to responses
      const formattedResponse = {
        id: newMessage.id,
        type: 'ai',
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        invoke_type: newMessage.invoke_type,
        test_case: newMessage.test_case,
        files: newMessage.file_name ? [{
          name: newMessage.file_name,
          type: newMessage.file_type,
          url: newMessage.file_url
        }] : []
      };

      setResponses(prev => [...prev, formattedResponse]);

      // Clear input fields after successful submission
      inputPanelRef.current?.clearInputs();

      // Check for test case generation - auto redirect
      // Test cases are returned when content is an array OR invoke_type is test-case-approval
      if (Array.isArray(newMessage.content) || newMessage.invoke_type === 'test-case-approval') {
        setTimeout(() => {
          router.push(`/dashboard/projects/${projectId}/test-cases?chatId=${chatId}`);
        }, 2000); // Give user time to see the response
      }

    } catch (error) {
      console.error('Failed to start testing:', error);
      // Add error message to responses
      setResponses(prev => [...prev, {
        type: 'error',
        content: 'Failed to process your request. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendFollowUp = async (input: { text?: string; files?: File[] }) => {
    if (!chatId) return;

    setIsProcessing(true);
    try {
      // Create FormData for follow-up message
      const formData = new FormData();
      formData.append('invoke_type', 'resume');
      if (input.text) {
        formData.append('content', input.text);
      }
      if (input.files && input.files.length > 0) {
        input.files.forEach((file, index) => {
          formData.append('files', file);
        });
      }

      // Send follow-up message via chat API
      const response = await api.post(`/chat/${chatId}/send-message?invoke_type=resume`, formData, {
        headers: {
          'Content-Type': undefined, // Let browser set proper multipart boundary
        },
      });

      const newMessage = response.data;

      // Add to responses
      const formattedResponse = {
        id: newMessage.id,
        type: 'ai',
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        invoke_type: newMessage.invoke_type,
        test_case: newMessage.test_case,
        files: newMessage.file_name ? [{
          name: newMessage.file_name,
          type: newMessage.file_type,
          url: newMessage.file_url
        }] : []
      };

      setResponses(prev => [...prev, formattedResponse]);

      // Clear input fields after successful submission
      inputPanelRef.current?.clearInputs();

      // Check for test case generation - auto redirect
      // Test cases are returned when content is an array OR invoke_type is test-case-approval
      if (Array.isArray(newMessage.content) || newMessage.invoke_type === 'test-case-approval') {
        setTimeout(() => {
          router.push(`/dashboard/projects/${projectId}/test-cases?chatId=${chatId}`);
        }, 2000);
      }

    } catch (error) {
      console.error('Failed to send follow-up:', error);
      // Add error message to responses
      setResponses(prev => [...prev, {
        type: 'error',
        content: 'Failed to send follow-up message. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading testing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <TestingHeader
        projectId={projectId}
        projectName={projectName}
        chatTitle={chatTitle}
        onBack={handleBackToProjects}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Input Panel */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col overflow-hidden">
          <InputPanel
            ref={inputPanelRef}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            disabled={false}
            isFollowUp={responses.length > 0}
          />
        </div>

        {/* Output Panel */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col overflow-hidden">
          <OutputPanel
            responses={responses}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageSquare, Send, Download, TestTube } from 'lucide-react';

interface Response {
  type: 'text' | 'test-cases' | 'question';
  content: string;
  testCases?: any[];
  timestamp: string;
}

interface OutputPanelProps {
  responses: Response[];
  isProcessing: boolean;
  onSendFollowUp: (message: string) => void;
}

export function OutputPanel({ responses, isProcessing, onSendFollowUp }: OutputPanelProps) {
  const [followUpMessage, setFollowUpMessage] = useState('');

  const handleSendFollowUp = () => {
    if (followUpMessage.trim()) {
      onSendFollowUp(followUpMessage.trim());
      setFollowUpMessage('');
    }
  };

  const handleExportConversation = () => {
    const conversationContent = responses.map((response, index) => {
      const typeLabel = response.type === 'test-cases' ? 'Test Cases Generated' :
                       response.type === 'question' ? 'Question' : 'Analysis';
      return `--- ${typeLabel} ---\n${response.content}\n\n`;
    }).join('');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `testing-conversation-${timestamp}.txt`;

    const blob = new Blob([conversationContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderResponse = (response: Response, index: number) => {
    const isLastResponse = index === responses.length - 1;
    const needsFollowUp = response.type === 'question' && isLastResponse && !isProcessing;

    return (
      <div key={index} className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {response.type === 'test-cases' ? (
                <>
                  <TestTube size={16} />
                  Test Cases Generated
                </>
              ) : response.type === 'question' ? (
                <>
                  <MessageSquare size={16} />
                  Question
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  Analysis
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {response.type === 'test-cases' ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {response.content}
                  </ReactMarkdown>
                </div>
                <Button className="w-full" size="lg">
                  <TestTube size={16} className="mr-2" />
                  View Test Cases
                </Button>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const inline = !match;

                      if (!inline && match) {
                        return (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            className="rounded-md text-sm"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        );
                      }

                      return (
                        <code
                          className="bg-muted px-1.5 py-0.5 rounded text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {response.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Follow-up input for questions */}
            {needsFollowUp && (
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Your Response:</label>
                  <Textarea
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    placeholder="Provide more details..."
                    rows={3}
                  />
                  <Button
                    onClick={handleSendFollowUp}
                    disabled={!followUpMessage.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send size={14} />
                    Send Response
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                AI Analysis & Results
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI will analyze your requirements and generate comprehensive test cases
              </p>
            </div>
            {responses.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportConversation}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export Chat
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {responses.length === 0 && !isProcessing ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="space-y-4">
                <MessageSquare size={48} className="mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium text-muted-foreground">Ready to Analyze</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your requirements and click "Start Testing" to begin
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {responses.map((response, index) => renderResponse(response, index))}

              {isProcessing && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                      <span className="text-sm">AI is analyzing your requirements...</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageSquare, Send, Copy, Download, TestTube } from 'lucide-react';

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

  const handleCopyResponse = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownloadResponse = (content: string, filename: string = 'response.txt') => {
    const blob = new Blob([content], { type: 'text/plain' });
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
            <div className="flex items-center justify-between">
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
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyResponse(response.content)}
                  className="h-8 w-8 p-0"
                >
                  <Copy size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadResponse(response.content)}
                  className="h-8 w-8 p-0"
                >
                  <Download size={14} />
                </Button>
              </div>
            </div>
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
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            AI Analysis & Results
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI will analyze your requirements and generate comprehensive test cases
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
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
            <div className="flex-1 overflow-y-auto space-y-4">
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
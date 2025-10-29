import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser ? (
        // User message bubble
        <div
          className="px-4 py-2 rounded-xl break-words whitespace-pre-wrap bg-[#303030] text-white"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '1.15rem',
            fontWeight: 400,
            boxShadow: '0 2px 8px 0 #0002',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            maxWidth: '70%',
          }}
        >
          {message.content}
        </div>
      ) : (
        // Bot message with markdown (ChatGPT style - no background for text)
        <div
          className="w-full text-[#ededed]"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '1.08rem',
            fontWeight: 400,
            lineHeight: '1.75',
          }}
        >
          <ReactMarkdown
            children={message.content || ''}
            components={{
              // Wrap code blocks in a container with margin
              pre({ children, ...props }) {
                return (
                  <div style={{ margin: '1rem 0' }}>
                    {children}
                  </div>
                );
              },
              // Handle code blocks and inline code
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const inline = !match;
                
                // Code block (multi-line with language)
                if (!inline && match) {
                  return (
                    <SyntaxHighlighter
                      style={oneDark as any}
                      language={match[1]}
                      customStyle={{ 
                        borderRadius: 8, 
                        fontSize: '0.95rem',
                        padding: '2rem',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }
                
                // Inline code
                return (
                  <code
                    className={className}
                    style={{
                      background: '#2d2d2d',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: '0.9em',
                      color: '#e6e6e6',
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // Style paragraphs
              p({ children, ...props }) {
                return (
                  <p style={{ margin: '0.75rem 0' }} {...props}>
                    {children}
                  </p>
                );
              },
              // Style lists
              ul({ children, ...props }) {
                return (
                  <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...props}>
                    {children}
                  </ul>
                );
              },
              ol({ children, ...props }) {
                return (
                  <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...props}>
                    {children}
                  </ol>
                );
              },
              // Style headings
              h1({ children, ...props }) {
                return (
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '1rem 0 0.5rem' }} {...props}>
                    {children}
                  </h1>
                );
              },
              h2({ children, ...props }) {
                return (
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0.875rem 0 0.5rem' }} {...props}>
                    {children}
                  </h2>
                );
              },
              h3({ children, ...props }) {
                return (
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0.75rem 0 0.5rem' }} {...props}>
                    {children}
                  </h3>
                );
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

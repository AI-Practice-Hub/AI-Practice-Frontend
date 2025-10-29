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
            fontWeight: 500,
            boxShadow: '0 2px 8px 0 #0002',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            maxWidth: '70%',
          }}
        >
          {message.content}
        </div>
      ) : (
        // Bot message with markdown
        <div
          className="w-full bg-[#18181a] text-[#ededed] rounded-xl p-6 shadow-md border border-[#232323]"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '1.08rem',
            fontWeight: 400,
            margin: '0.5rem 0',
            overflowX: 'auto',
          }}
        >
          <ReactMarkdown
            children={message.content || ''}
            components={{
              pre({ children, ...props }) {
                return (
                  <div style={{ margin: '0.5rem 0' }}>
                    {children}
                  </div>
                );
              },
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const inline = !match;
                if (!inline && match) {
                  return (
                    <SyntaxHighlighter
                      style={oneDark as any}
                      language={match[1]}
                      customStyle={{ borderRadius: 8, fontSize: '1rem' }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }
                return (
                  <code
                    className={className}
                    style={{
                      background: '#232323',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: '1em',
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

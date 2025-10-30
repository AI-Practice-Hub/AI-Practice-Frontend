import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileText, Image as ImageIcon, Copy, Download, Check } from 'lucide-react';
import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

// Code Block Component with Copy and Download
function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([children], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'relative', margin: '1rem 0' }}>
      {/* Action Buttons */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          gap: '6px',
          zIndex: 10,
        }}
      >
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a1a] hover:bg-[#252525] transition text-[#e6e6e6] text-xs border border-[#333]"
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a1a] hover:bg-[#252525] transition text-[#e6e6e6] text-xs border border-[#333]"
          title="Download code"
        >
          <Download size={14} />
          <span>Download</span>
        </button>
      </div>

      {/* Code Syntax Highlighter */}
      <SyntaxHighlighter
        style={oneDark as any}
        language={language}
        customStyle={{
          borderRadius: 8,
          fontSize: '0.95rem',
          padding: '2rem',
          paddingTop: '3rem', // Extra padding for buttons
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser ? (
        // User message bubble
        <div
          className="max-w-[70%]"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden border border-[#404040] bg-[#2a2a2a]"
                >
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-[100px] h-[100px] object-cover cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(attachment.url, '_blank')}
                    />
                  ) : (
                    <div className="w-[100px] h-[100px] flex flex-col items-center justify-center bg-[#2a2a2a] cursor-pointer hover:bg-[#333] transition">
                      <FileText size={32} color="#888" />
                      <span className="text-[10px] text-[#888] mt-2 px-2 text-center truncate w-full">
                        {attachment.name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Message content */}
          {message.content && (
            <div
              className="px-4 py-2 rounded-xl break-words whitespace-pre-wrap bg-[#303030] text-white"
              style={{
                fontSize: '1.15rem',
                fontWeight: 400,
                boxShadow: '0 2px 8px 0 #0002',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {message.content}
            </div>
          )}
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
              // Wrap code blocks in a container
              pre({ children, ...props }) {
                return <>{children}</>;
              },
              // Handle code blocks and inline code
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const inline = !match;
                
                // Code block (multi-line with language)
                if (!inline && match) {
                  const codeString = String(children).replace(/\n$/, '');
                  return <CodeBlock language={match[1]} children={codeString} />;
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

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
    <div style={{ position: 'relative', margin: '0.75rem 0' }} className="sm:my-4">
      {/* Action Buttons */}
      <div
        className="absolute top-2 right-2 flex gap-1 sm:gap-1.5 z-10"
      >
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-md bg-[#1a1a1a] hover:bg-[#252525] transition text-[#e6e6e6] text-[10px] sm:text-xs border border-[#333]"
          title="Copy code"
        >
          {copied ? <Check size={12} className="sm:w-3.5 sm:h-3.5" /> : <Copy size={12} className="sm:w-3.5 sm:h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-md bg-[#1a1a1a] hover:bg-[#252525] transition text-[#e6e6e6] text-[10px] sm:text-xs border border-[#333]"
          title="Download code"
        >
          <Download size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>

      {/* Code Syntax Highlighter */}
      <SyntaxHighlighter
        style={oneDark as any}
        language={language}
        customStyle={{
          borderRadius: 8,
          fontSize: '0.8rem',
          padding: '1rem',
          paddingTop: '2.5rem',
          overflowX: 'auto',
        }}
        className="sm:text-sm md:text-base sm:p-8 sm:pt-12"
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
          className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%]"
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
                      className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] object-cover cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(attachment.url, '_blank')}
                    />
                  ) : (
                    <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] flex flex-col items-center justify-center bg-[#2a2a2a] cursor-pointer hover:bg-[#333] transition">
                      <FileText size={28} className="sm:w-8 sm:h-8" color="#888" />
                      <span className="text-[9px] sm:text-[10px] text-[#888] mt-1 sm:mt-2 px-1 sm:px-2 text-center truncate w-full">
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
              className="px-3 py-2 sm:px-4 rounded-xl break-words whitespace-pre-wrap bg-[#303030] text-white text-sm sm:text-base"
              style={{
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
          className="w-full max-w-full overflow-hidden text-[#ededed] text-sm sm:text-base"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            lineHeight: '1.75',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <ReactMarkdown
            children={message.content || ''}
            components={{
              // Wrap code blocks in a container
              pre({ children, ...props }) {
                return <div className="max-w-full overflow-hidden">{children}</div>;
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
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
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
                  <p className="my-2 sm:my-3 max-w-full break-words" {...props}>
                    {children}
                  </p>
                );
              },
              // Style lists
              ul({ children, ...props }) {
                return (
                  <ul className="my-2 pl-4 sm:pl-6 max-w-full" {...props}>
                    {children}
                  </ul>
                );
              },
              ol({ children, ...props }) {
                return (
                  <ol className="my-2 pl-4 sm:pl-6 max-w-full" {...props}>
                    {children}
                  </ol>
                );
              },
              li({ children, ...props }) {
                return (
                  <li className="my-1 break-words" {...props}>
                    {children}
                  </li>
                );
              },
              // Style headings
              h1({ children, ...props }) {
                return (
                  <h1 className="text-xl sm:text-2xl font-semibold mt-3 sm:mt-4 mb-2 break-words" {...props}>
                    {children}
                  </h1>
                );
              },
              h2({ children, ...props }) {
                return (
                  <h2 className="text-lg sm:text-xl font-semibold mt-3 mb-2 break-words" {...props}>
                    {children}
                  </h2>
                );
              },
              h3({ children, ...props }) {
                return (
                  <h3 className="text-base sm:text-lg font-semibold mt-2 mb-1 break-words" {...props}>
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

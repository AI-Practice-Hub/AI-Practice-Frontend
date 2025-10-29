import React from 'react';
import { Message } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { ThinkingLoader } from './ThinkingLoader';

interface MessageListProps {
  messages: Message[];
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  isThinking?: boolean;
}

export function MessageList({ messages, chatEndRef, isThinking = false }: MessageListProps) {
  if (messages.length === 0 && !isThinking) {
    return (
      <div
        className="w-full flex-1 flex flex-col justify-center items-center select-none"
        style={{ marginTop: '25vh', marginLeft: '-3vh' }}
      >
        <h1
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: '2.5rem',
            color: '#fff',
            opacity: 0.9,
            letterSpacing: '-0.01em',
          }}
        >
          Welcome to AI Practice Hub
        </h1>
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '1.25rem',
            color: '#bdbdbd',
            marginTop: 8,
          }}
        >
          Start a conversation or upload an image to begin.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar"
      style={{ minHeight: 0, padding: '0 2rem' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '48rem',
          margin: '0 auto',
          width: '100%',
          paddingTop: '1rem',
          paddingBottom: '1rem',
        }}
      >
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        {isThinking && <ThinkingLoader />}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

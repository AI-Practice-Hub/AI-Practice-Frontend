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
        className="w-full flex-1 flex flex-col justify-center items-center select-none px-4"
      >
        <h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-center"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            opacity: 0.9,
            letterSpacing: '-0.01em',
          }}
        >
          Welcome to TestSamurAi Hub
        </h1>
        <p
          className="text-base sm:text-lg md:text-xl text-muted-foreground mt-2 text-center"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
          }}
        >
          Start a conversation or upload an image to begin.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-8"
      style={{ minHeight: 0 }}
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

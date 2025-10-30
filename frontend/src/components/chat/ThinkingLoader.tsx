import React from 'react';

export function ThinkingLoader() {
  return (
    <div
      className="w-full bg-transparent text-[#ededed] rounded-xl"
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '1.08rem',
        fontWeight: 400,
        margin: '0.5rem 0',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[#bdbdbd]">Thinking</span>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[#bdbdbd] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-[#bdbdbd] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-[#bdbdbd] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}

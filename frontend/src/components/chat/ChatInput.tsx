import React, { useRef } from 'react';
import { Image as Gallery, Mic, Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPdfSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  recording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onImageSelect,
  onPdfSelect,
  recording,
  onStartRecording,
  onStopRecording,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <form
      className="w-full flex justify-center mt-4 pb-4"
      onSubmit={onSubmit}
      autoComplete="off"
      style={{ flexShrink: 0, padding: '2rem 2rem' }}
    >
      <div
        className="flex items-center bg-[#303030] rounded-full px-3 py-2"
        style={{
          border: '2px solid #fff',
          boxShadow: '0 0 0 2px #fff2',
          minHeight: 56,
          transition: 'border 0.2s, box-shadow 0.2s',
          gap: 8,
          maxWidth: '48rem',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Gallery/Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-[#292929] transition focus:outline-none"
          title="Upload image"
          tabIndex={0}
        >
          <Gallery size={22} color="#fff" />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={onImageSelect}
        />

        {/* Text input */}
        <input
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#bdbdbd] font-normal text-base px-2"
          placeholder="Type your message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '1.1rem',
            minHeight: 40,
            fontWeight: 400,
          }}
        />

        {/* Mic or Send button toggle */}
        {value.trim() === '' && !recording ? (
          <button
            type="button"
            onClick={onStartRecording}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-[#292929] transition focus:outline-none"
            title="Record audio"
            tabIndex={0}
          >
            <Mic size={22} color="#fff" />
          </button>
        ) : !recording ? (
          <button
            type="submit"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#27292b] hover:bg-[#232323] transition focus:outline-none"
            title="Send message"
            tabIndex={0}
          >
            <Send size={22} color="#fff" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopRecording}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-red-700 animate-pulse transition focus:outline-none"
            title="Stop recording"
            tabIndex={0}
          >
            <Mic size={22} color="#fff" />
          </button>
        )}
      </div>
    </form>
  );
}

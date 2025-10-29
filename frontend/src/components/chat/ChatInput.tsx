import React, { useRef, useState, useEffect } from 'react';
import { Image as Gallery, Mic, Send, X } from 'lucide-react';

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Handle image selection with preview
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    onImageSelect(e);
  };

  // Remove image preview
  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submit and clear preview
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
    removeImage();
  };

  return (
    <form
      className="w-full flex justify-center pb-4"
      onSubmit={handleSubmit}
      autoComplete="off"
      style={{ flexShrink: 0, padding: '0 2rem 1rem 2rem' }}
    >
      <div
        style={{
          maxWidth: '48rem',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <div className="relative rounded-lg overflow-hidden border-2 border-[#404040]">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-[200px] max-h-[200px] object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black/70 hover:bg-black/90 rounded-full p-1.5 transition"
                title="Remove image"
              >
                <X size={16} color="#fff" />
              </button>
            </div>
          </div>
        )}

        {/* Input Container */}
        <div
          className="flex items-end bg-[#303030] rounded-3xl px-3 py-2"
          style={{
            border: '2px solid #fff',
            boxShadow: '0 0 0 2px #fff2',
            minHeight: 56,
            transition: 'border 0.2s, box-shadow 0.2s',
            gap: 8,
          }}
        >
          {/* Gallery/Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-[#404040] transition focus:outline-none flex-shrink-0"
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
            onChange={handleImageSelect}
          />

          {/* Auto-expanding Textarea */}
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#bdbdbd] font-normal resize-none custom-scrollbar"
            placeholder="Type your message..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            rows={1}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '1.1rem',
              fontWeight: 400,
              minHeight: '40px',
              maxHeight: '200px',
              overflowY: 'auto',
              paddingTop: '8px',
              paddingBottom: '8px',
            }}
          />

          {/* Mic or Send button toggle */}
          {value.trim() === '' && !recording && !imagePreview ? (
            <button
              type="button"
              onClick={onStartRecording}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-[#404040] transition focus:outline-none flex-shrink-0"
              title="Record audio"
              tabIndex={0}
            >
              <Mic size={22} color="#fff" />
            </button>
          ) : !recording ? (
            <button
              type="submit"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#27292b] hover:bg-[#1a1a1a] transition focus:outline-none flex-shrink-0"
              title="Send message"
              tabIndex={0}
            >
              <Send size={22} color="#fff" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopRecording}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-red-700 animate-pulse transition focus:outline-none flex-shrink-0"
              title="Stop recording"
              tabIndex={0}
            >
              <Mic size={22} color="#fff" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

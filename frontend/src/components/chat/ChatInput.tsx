import React, { useRef, useState, useEffect } from 'react';
import { Image as Gallery, Mic, Send, X, FileText, Paperclip } from 'lucide-react';

export interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'pdf';
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent, files: FilePreview[]) => void;
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
  
  // Multiple files preview state
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const MAX_FILES = 5;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Handle multiple file selection with preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'pdf') => {
    const files = Array.from(e.target.files || []);
    
    // Check if adding these files would exceed the limit
    if (filePreviews.length + files.length > MAX_FILES) {
      alert(`You can only upload up to ${MAX_FILES} files at once`);
      return;
    }

    // Process each file
    files.forEach((file) => {
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => [
            ...prev,
            { file, preview: reader.result as string, type: 'image' },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, use a generic icon preview
        setFilePreviews((prev) => [
          ...prev,
          { file, preview: '', type: 'pdf' },
        ]);
      }
    });

    // Call original handlers
    if (fileType === 'image') {
      onImageSelect(e);
    } else {
      onPdfSelect(e);
    }
  };

  // Remove specific file from preview
  const removeFile = (index: number) => {
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearAllFiles = () => {
    setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  // Handle form submit and clear previews
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, filePreviews); // Pass files to parent
    clearAllFiles();
  };

  return (
    <form
      className="w-full flex justify-center pb-2 sm:pb-4 px-4 sm:px-6 md:px-8"
      onSubmit={handleSubmit}
      autoComplete="off"
      style={{ flexShrink: 0 }}
    >
      <div
        style={{
          maxWidth: '49rem',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* File Previews Gallery */}
        {filePreviews.length > 0 && (
          <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
            {filePreviews.map((filePreview, index) => (
              <div key={index} className="relative inline-block">
                <div className="relative rounded-lg overflow-hidden border-2 border-[#404040] bg-[#2a2a2a]">
                  {filePreview.type === 'image' ? (
                    <img
                      src={filePreview.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] object-cover"
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] flex flex-col items-center justify-center bg-[#2a2a2a]">
                      <FileText size={24} className="sm:w-7 sm:h-7" color="#888" />
                      <span className="text-[9px] sm:text-[10px] text-[#888] mt-1">PDF</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-600 hover:bg-red-700 rounded-full p-0.5 sm:p-1 transition shadow-md"
                    title="Remove file"
                  >
                    <X size={12} className="sm:w-3.5 sm:h-3.5" color="#fff" />
                  </button>
                </div>
              </div>
            ))}
            {filePreviews.length < MAX_FILES && (
              <span className="text-[10px] sm:text-xs text-[#888] self-end pb-1.5 sm:pb-2">
                {MAX_FILES - filePreviews.length} more allowed
              </span>
            )}
          </div>
        )}

        {/* Input Container */}
        <div
          className="flex items-end bg-transparent rounded-full px-2 sm:px-3 py-1.5 sm:py-2 gap-1.5 sm:gap-2"
          style={{
            border: '1px solid #505050ff',
            boxShadow: '0 0 0 1px #fff2',
            minHeight: 48,
            transition: 'border 0.2s, box-shadow 0.2s',
          }}
        >
          {/* File upload button (images + PDFs) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-transparent hover:bg-[#404040] transition focus:outline-none flex-shrink-0"
            title="Upload files (images/PDFs)"
            tabIndex={0}
            disabled={filePreviews.length >= MAX_FILES}
          >
            <Paperclip size={18} className="sm:w-[22px] sm:h-[22px]" color={filePreviews.length >= MAX_FILES ? '#555' : '#fff'} />
          </button>
          <input
            type="file"
            accept="image/*,.pdf"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const isPdf = file.type === 'application/pdf';
                handleFileSelect(e, isPdf ? 'pdf' : 'image');
              }
            }}
          />

          {/* Auto-expanding Textarea */}
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#bdbdbd] font-normal resize-none custom-scrollbar text-sm sm:text-base"
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
              fontWeight: 400,
              minHeight: '36px',
              maxHeight: '160px',
              overflowY: 'auto',
              paddingTop: '6px',
              paddingBottom: '6px',
            }}
          />

          {/* Mic or Send button toggle */}
          {value.trim() === '' && !recording && filePreviews.length === 0 ? (
            <button
              type="button"
              onClick={onStartRecording}
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-transparent hover:bg-[#404040] transition focus:outline-none flex-shrink-0"
              title="Record audio"
              tabIndex={0}
            >
              <Mic size={18} className="sm:w-[22px] sm:h-[22px]" color="#fff" />
            </button>
          ) : !recording ? (
            <button
              type="submit"
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-transparent hover:bg-[#404040] transition focus:outline-none flex-shrink-0"
              title="Send message"
              tabIndex={0}
            >
              <Send size={18} className="sm:w-[22px] sm:h-[22px]" color="#fff" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopRecording}
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-700 animate-pulse transition focus:outline-none flex-shrink-0"
              title="Stop recording"
              tabIndex={0}
            >
              <Mic size={18} className="sm:w-[22px] sm:h-[22px]" color="#fff" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

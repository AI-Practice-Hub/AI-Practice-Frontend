"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../chat-scrollbar.css";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useChat, useWebSocket, useAudioRecorder, useToast } from "@/hooks";
import { ChatSidebar, ChatHeader, MessageList, ChatInput, ThinkingLoader, FilePreview } from "@/components/chat";
import { MessageAttachment } from "@/types/chat";

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Toast notifications
  const toast = useToast();
  
  // Chat management
  const { chats, selectedChat, messages, createChat, selectChat, addMessage, loading } = useChat();
  
  // Track if we've initialized from URL
  const [urlInitialized, setUrlInitialized] = useState(false);
  
  // Initialize selected chat from URL on mount
  useEffect(() => {
    if (!urlInitialized && chats.length > 0) {
      const chatIdFromUrl = searchParams.get('id');
      if (chatIdFromUrl) {
        const chatId = parseInt(chatIdFromUrl, 10);
        if (!isNaN(chatId)) {
          // Check if chat exists in the list
          const chatExists = chats.some(chat => chat.id === chatId);
          if (chatExists) {
            selectChat(chatId);
          } else {
            // Chat doesn't exist, clear URL
            router.replace('/chat');
          }
        }
      }
      setUrlInitialized(true);
    }
  }, [urlInitialized, chats, searchParams, selectChat, router]);
  
  // Custom select chat function that updates URL
  const handleSelectChat = (chatId: number | null) => {
    selectChat(chatId);
    if (chatId) {
      router.push(`/chat?id=${chatId}`);
    } else {
      router.push('/chat');
    }
  };
  
  // Thinking state (bot is typing)
  const [isThinking, setIsThinking] = useState(false);
  
  // WebSocket connection
  const { sendMessage, isConnected } = useWebSocket(selectedChat, (data) => {
    if (data.message) {
      setIsThinking(false); // Stop thinking animation
      addMessage({
        sender: "bot",
        content: data.message,
        invoke_type: data.type, // Store invoke_type from response
        timestamp: new Date().toISOString(),
      });
    }
  }, messages);
  
  // Audio recording
  const { recording, startRecording, stopRecording } = useAudioRecorder((blob, url) => {
    // Handle recording complete
    if (blob.size > 2 * 1024 * 1024) {
      toast.error("Audio too large (max 2MB, ~2min)");
      return;
    }
    
    const fileName = `audio_${Date.now()}.webm`;
    sendMessage({
      type: "audio",
      file_name: fileName,
      file_size: blob.size,
      duration: null,
    });
    
    addMessage({
      sender: "user",
      content: null,
      file_type: "audio",
      file_name: fileName,
      file_url: url,
      timestamp: new Date().toISOString(),
    });
    
    setIsThinking(true); // Start thinking animation
  });
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Close sidebar on mobile when chat is selected
  const handleSelectChatMobile = (chatId: number | null) => {
    handleSelectChat(chatId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Create new chat
  const handleNewChat = async () => {
    const newChat = await createChat("New Chat");
    // Update URL with new chat ID
    router.push(`/chat?id=${newChat.id}`);
  };

  // Send message
  const handleSend = async (e: React.FormEvent, files: FilePreview[]) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;
    
    let chatId = selectedChat;
    
    // Convert files to attachments
    const attachments: MessageAttachment[] = files.map(f => ({
      type: f.type,
      name: f.file.name,
      url: f.preview, // Use the data URL for display
      size: f.file.size,
    }));
    
    // If no chat selected, create one first and send message
    if (!chatId) {
      try {
        const newChat = await createChat(input.slice(0, 30) || 'New Chat');
        chatId = newChat.id;
        
        // Update URL with new chat ID
        router.push(`/chat?id=${chatId}`);
        
        // Send message after chat is created
        if (input.trim()) {
          sendMessage({ type: "text", content: input });
        }
        
        // Send file messages
        files.forEach(file => {
          sendMessage({
            type: file.type,
            file_name: file.file.name,
            file_size: file.file.size
          });
        });
        
        addMessage({
          sender: "user",
          content: input.trim() || null,
          attachments: attachments.length > 0 ? attachments : undefined,
          timestamp: new Date().toISOString(),
        });
        setInput("");
        setIsThinking(true); // Start thinking animation
      } catch (error) {
        toast.error("Failed to create chat");
      }
      return;
    }
    
    // Send message via WebSocket
    if (input.trim()) {
      sendMessage({ type: "text", content: input });
    }
    
    // Send file messages
    files.forEach(file => {
      sendMessage({
        type: file.type,
        file_name: file.file.name,
        file_size: file.file.size
      });
    });
    
    addMessage({
      sender: "user",
      content: input.trim() || null,
      attachments: attachments.length > 0 ? attachments : undefined,
      timestamp: new Date().toISOString(),
    });
    setInput("");
    setIsThinking(true); // Start thinking animation
  };

  // Handle file/image/pdf upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "pdf") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (type === "image" && file.size > 3 * 1024 * 1024) {
      toast.error("Image file too large (max 3MB)");
      return;
    }
    if (type === "pdf" && file.size > 5 * 1024 * 1024) {
      toast.error("PDF file too large (max 5MB)");
      return;
    }
    
    // Send file metadata via WebSocket
    sendMessage({
      type,
      file_name: file.name,
      file_size: file.size
    });
    
    addMessage({
      sender: "user",
      content: null,
      file_type: type,
      file_name: file.name,
      file_url: `/files/${file.name}`,
      timestamp: new Date().toISOString()
    });
    
    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  return (
    <div
      className="flex h-screen min-h-0 relative"
      style={{ backgroundColor: '#212121', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChatMobile}
        onNewChat={handleNewChat}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
          {/* Messages */}
          <MessageList messages={messages} chatEndRef={chatEndRef} isThinking={isThinking} />

          {/* Input */}
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            onImageSelect={(e) => handleFileChange(e, 'image')}
            onPdfSelect={(e) => handleFileChange(e, 'pdf')}
            recording={recording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageContent />
    </ProtectedRoute>
  );
}

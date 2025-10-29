"use client";

import React, { useState, useRef, useEffect } from "react";
import "../chat-scrollbar.css";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useChat, useWebSocket, useAudioRecorder, useToast } from "@/hooks";
import { ChatSidebar, ChatHeader, MessageList, ChatInput, ThinkingLoader } from "@/components/chat";

function ChatPageContent() {
  // Toast notifications
  const toast = useToast();
  
  // Chat management
  const { chats, selectedChat, messages, createChat, selectChat, addMessage, loading } = useChat();
  
  // Thinking state (bot is typing)
  const [isThinking, setIsThinking] = useState(false);
  
  // WebSocket connection
  const { sendMessage, isConnected } = useWebSocket(selectedChat, (data) => {
    if (data.message) {
      setIsThinking(false); // Stop thinking animation
      addMessage({
        sender: "bot",
        content: data.message,
        timestamp: new Date().toISOString(),
      });
    }
  });
  
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Create new chat
  const handleNewChat = async () => {
    await createChat("New Chat");
  };

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    let chatId = selectedChat;
    
    // If no chat selected, create one first and send message
    if (!chatId) {
      try {
        const newChat = await createChat(input.slice(0, 30));
        chatId = newChat.id;
        
        // Send message after chat is created
        sendMessage({ type: "text", content: input });
        addMessage({
          sender: "user",
          content: input,
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
    sendMessage({ type: "text", content: input });
    addMessage({
      sender: "user",
      content: input,
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
      className="flex h-screen min-h-0"
      style={{ backgroundColor: '#212121', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={selectChat}
        onNewChat={handleNewChat}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <ChatHeader />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
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

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TestCase } from '@/types/chat';
import { useChat, useApi, useToast } from '@/hooks';
import { ChatSidebar, ChatHeader, MessageList, ChatInput, ThinkingLoader, TestCaseModal } from '@/components/chat';
import { FilePreview } from '@/components/chat/ChatInput';
import { MessageAttachment } from '@/types/chat';
import '../chat-scrollbar.css';

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get project ID from URL
  const projectId = searchParams.get('projectId') ? parseInt(searchParams.get('projectId')!, 10) : undefined;
  
  // Toast notifications
  const toast = useToast();
  
  // Chat management - now filtered by project
  const { chats, selectedChat, messages, createChat, selectChat, addMessage, updateChat, deleteChat, loading } = useChat(projectId);
  
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
            router.replace(`/chat${projectId ? `?projectId=${projectId}` : ''}`);
          }
        }
      }
      setUrlInitialized(true);
    }
  }, [urlInitialized, chats, searchParams, selectChat, router, projectId]);
  
  // Custom select chat function that updates URL
  const handleSelectChat = (chatId: number | null) => {
    selectChat(chatId);
    if (chatId) {
      router.push(`/chat?id=${chatId}${projectId ? `&projectId=${projectId}` : ''}`);
    } else {
      router.push(`/chat${projectId ? `?projectId=${projectId}` : ''}`);
    }
  };
  
  // Thinking state (bot is typing)
  const [isThinking, setIsThinking] = useState(false);
  
  // Test case modal state
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [isSubmittingTestCases, setIsSubmittingTestCases] = useState(false);
  
  // WebSocket connection
  const { sendMessage, isConnected } = useApi(selectedChat, (data) => {
    if (data.type === 'test-case-approval' && data.test_case) {
      // Show test case selection modal instead of adding to chat
      setAvailableTestCases(data.test_case as unknown as TestCase[]);
      setShowTestCaseModal(true);
      setIsThinking(false);
    } else if (data.message) {
      setIsThinking(false); // Stop thinking animation
      addMessage({
        sender: "bot",
        content: data.message,
        invoke_type: data.type, // Store invoke_type from response
        timestamp: new Date().toISOString(),
      });
    }
  }, messages);
  
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
    if (!projectId) {
      toast.error("Cannot create chat: No project selected");
      return;
    }
    const newChat = await createChat("New Chat", projectId);
    // Update URL with new chat ID
    router.push(`/chat?id=${newChat.id}&projectId=${projectId}`);
  };

  // Send message
  const handleSend = async (e: React.FormEvent | null, files: FilePreview[]) => {
    e?.preventDefault();
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
      if (!projectId) {
        toast.error("Cannot create chat: No project selected");
        return;
      }
      try {
        const newChat = await createChat(input.slice(0, 30) || 'New Chat', projectId);
        chatId = newChat.id;
        
        // Update URL with new chat ID
        router.push(`/chat?id=${chatId}&projectId=${projectId}`);
        
        // Send combined message with text and files
        sendMessage({ 
          content: input.trim() || undefined,
          files: files.map(f => f.file)
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
    
    // Send combined message with text and files
    sendMessage({ 
      content: input.trim() || undefined,
      files: files.map(f => f.file)
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

  // Handle test case selection submission
  const handleTestCaseSubmit = async (selectedTestCases: TestCase[]) => {
    if (!selectedChat || selectedTestCases.length === 0) return;

    setIsSubmittingTestCases(true);
    try {
      // Send the selected test cases as a JSON string
      sendMessage({
        content: JSON.stringify(selectedTestCases)
      });

      // Add user message to chat
      addMessage({
        sender: "user",
        content: `Selected ${selectedTestCases.length} test case${selectedTestCases.length !== 1 ? 's' : ''}: ${selectedTestCases.map(tc => tc.title).join(', ')}`,
        timestamp: new Date().toISOString(),
      });

      setIsThinking(true); // Start thinking animation for bot response
    } catch (error) {
      toast.error("Failed to submit test cases");
    } finally {
      setIsSubmittingTestCases(false);
    }
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

    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  return (
    <div
      className="flex h-screen min-h-0 relative bg-background"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
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
        onUpdateChat={updateChat}
        onDeleteChat={deleteChat}
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
          />
        </div>
      </div>

      {/* Test Case Selection Modal */}
      <TestCaseModal
        isOpen={showTestCaseModal}
        onClose={() => setShowTestCaseModal(false)}
        testCases={availableTestCases}
        onSubmit={handleTestCaseSubmit}
        isLoading={isSubmittingTestCases}
      />
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

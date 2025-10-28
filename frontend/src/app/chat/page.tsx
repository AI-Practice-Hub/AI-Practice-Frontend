"use client";


import React, { useState, useEffect, useRef } from "react";
import { Menu, Image as Gallery, Mic, Send, Search, Plus, AlignJustify } from 'lucide-react';
import "./chat-scrollbar.css";
import { api } from "@/utils/api";


export default function ChatPage() {
  // Audio recording state/hooks must be inside the component
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Audio recording logic
  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Audio recording not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      audioChunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Send audio metadata via WebSocket
        if (wsRef.current && wsRef.current.readyState === 1) {
          if (blob.size > 2 * 1024 * 1024) {
            alert("Audio too large (max 2MB, ~2min)");
            return;
          }
          const fileName = `audio_${Date.now()}.webm`;
          wsRef.current.send(JSON.stringify({
            type: "audio",
            file_name: fileName,
            file_size: blob.size,
            duration: null // Optionally, extract duration if needed
          }));
          setMessages((prev: any[]) => [...prev, {
            sender: "user",
            content: null,
            file_type: "audio",
            file_name: fileName,
            file_url: URL.createObjectURL(blob),
            timestamp: new Date().toISOString()
          }]);
        }
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      // Auto-stop after 2 minutes
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setRecording(false);
        }
      }, 2 * 60 * 1000);
    } catch (err) {
      alert("Could not start audio recording.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setRecording(false);
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const pendingFirstMessage = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch chat list on mount
  useEffect(() => {
    api.get("/chat/").then(res => {
      setChats(res.data);
    });
  }, []);

  // Fetch messages and connect websocket when chat is selected
  useEffect(() => {
    if (selectedChat) {
      api.get(`/chat/${selectedChat}/messages`).then(res => {
        setMessages(res.data);
      });
      // WebSocket connection
      if (wsRef.current) wsRef.current.close();
      const ws = new WebSocket(`ws://localhost:8000/ws/chat/${selectedChat}`);
      ws.onopen = () => {
        // If there is a pending first message, send it now
        if (pendingFirstMessage.current) {
          ws.send(pendingFirstMessage.current);
          pendingFirstMessage.current = null;
        }
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message) {
          setMessages((prev) => [...prev, { sender: "bot", content: data.message, timestamp: new Date().toISOString() }]);
        }
      };
      wsRef.current = ws;
      return () => { ws.close(); };
    }
  }, [selectedChat]);

  // Create new chat
  const handleNewChat = async () => {
    const res = await api.post("/chat/", { title: "New Chat" });
    setChats([res.data, ...chats]);
    setSelectedChat(res.data.id);
    setMessages([]);
  };

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    let chatId = selectedChat;
    // If no chat selected, create one first
    if (!chatId) {
      const res = await api.post("/chat/", { title: input.slice(0, 30) });
      setChats([res.data, ...chats]);
      setSelectedChat(res.data.id);
      chatId = res.data.id;
      setMessages([]);
      // Save the first message to send after WebSocket connects
      pendingFirstMessage.current = JSON.stringify({ type: "text", content: input });
      setInput("");
      return;
    }
    // Send message via WebSocket only
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "text", content: input }));
      setMessages((prev) => [...prev, { sender: "user", content: input, timestamp: new Date().toISOString() }]);
      setInput("");
    }
  };

  // Handle file/image/pdf upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "pdf") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "image" && file.size > 3 * 1024 * 1024) {
      alert("Image file too large (max 3MB)");
      return;
    }
    if (type === "pdf" && file.size > 5 * 1024 * 1024) {
      alert("PDF file too large (max 5MB)");
      return;
    }
    // Send file metadata via WebSocket
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        type,
        file_name: file.name,
        file_size: file.size
      }));
      setMessages((prev) => [...prev, {
        sender: "user",
        content: null,
        file_type: type,
        file_name: file.name,
        file_url: `/files/${file.name}`,
        timestamp: new Date().toISOString()
      }]);
    }
    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  return (
  <div className="flex h-screen" style={{ backgroundColor: '#212121', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
  <aside className={`transition-all duration-200 shadow-lg h-full flex flex-col ${sidebarOpen ? 'w-64' : 'w-16'} min-w-[4rem]`} style={{ backgroundColor: '#171717', paddingTop: '0.5rem', paddingBottom: '1.25rem' }}>
    <div className="flex items-center gap-2 pl-4 pr-2 pt-2 pb-2 min-h-[3.5rem]" style={{ borderBottom: 'none' }}>
          {sidebarOpen ? (
            <>
              <span className="font-bold text-lg flex-1" style={{ color: '#fff' }}>Chats</span>
              <button onClick={() => setSidebarOpen((v) => !v)} className="text-2xl" style={{ color: '#fff' }}>
                <AlignJustify size={24} />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="mx-auto text-2xl w-full flex items-center justify-center" style={{ color: '#fff' }}>
              <AlignJustify size={24} />
            </button>
          )}
        </div>
        {sidebarOpen ? (
          <button onClick={handleNewChat} className="flex items-center gap-2 pl-3 pr-3 py-2 mt-1 mb-2 rounded-lg bg-[#232323] hover:bg-[#292929] text-white font-semibold transition shadow-none border border-[#232323] w-[90%] mx-auto h-11 min-h-[44px]">
            <Plus size={18} />
            <span>New chat</span>
          </button>
        ) : (
          <button onClick={handleNewChat} className="flex items-center justify-center mx-auto mt-8 mb-2 w-10 h-10 rounded-full bg-[#232323] hover:bg-[#292929] text-white transition shadow-none border border-[#232323]" title="New chat">
            <Plus size={20} />
          </button>
        )}
        {/* Search chat input */}
        {sidebarOpen && (
          <div className="pl-4 pr-4 mb-2">
            <div className="flex items-center bg-[#181818] rounded-lg px-3 py-2 border border-[#232323]">
              <Search size={16} className="text-[#bdbdbd] mr-2" />
              <input
                type="text"
                placeholder="Search chats"
                className="bg-transparent border-none outline-none text-[#bdbdbd] text-sm flex-1 font-normal"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              />
            </div>
          </div>
        )}
        {/* Chats label */}
        {sidebarOpen && (
          <div className="pl-4 pr-4 pt-2 pb-1">
            <span className="text-xs uppercase tracking-widest text-[#bdbdbd] font-semibold select-none" style={{ letterSpacing: '0.08em' }}>Chats</span>
          </div>
        )}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto pl-4 pr-4 custom-scrollbar">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full text-left px-4 py-2 my-1 rounded-lg transition font-normal text-white ${selectedChat === chat.id ? 'bg-[#232323]' : 'hover:bg-[#181818]'}`}
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1rem', fontWeight: 400, borderRadius: 10 }}
              >
                {chat.title || `Chat ${chat.id}`}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: '#212121' }}>
          <span className="text-2xl font-bold" style={{ color: '#fff' }}>AI Practice Hub</span>
          <div className="flex items-center gap-4">
            {/* Add user/profile/settings here */}
          </div>
        </nav>
        {/* Chat Area */}
        <div className="flex-1 flex flex-col justify-end items-center px-4 pb-8">
          {/* Welcome message for new chat */}
          {messages.length === 0 && (
            <div className="w-full flex-1 flex flex-col justify-center items-center select-none" style={{ marginTop: '25vh',marginLeft:'-3vh'}}>
              <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '2.5rem', color: '#fff', opacity: 0.9, letterSpacing: '-0.01em' }}>
                Welcome to AI Practice Hub
              </h1>
              <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400, fontSize: '1.25rem', color: '#bdbdbd', marginTop: 8 }}>
                Start a conversation or upload an image to begin.
              </p>
            </div>
          )}
          {/* Chat messages */}
          <div className="w-full max-w-2xl flex-1 flex flex-col justify-end space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-4 py-2 rounded-xl max-w-[70%] ${msg.sender === "user" ? "bg-[#b800ff] text-white" : "bg-[#232323] text-white"}`}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.15rem', fontWeight: 500, boxShadow: '0 2px 8px 0 #0002' }}
                >
                  {msg.file_type === "image" && msg.file_url ? (
                    <img src={msg.file_url} alt={msg.file_name} className="max-w-xs max-h-48 rounded" />
                  ) : msg.file_type === "pdf" && msg.file_url ? (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="underline text-blue-300">{msg.file_name || "PDF"}</a>
                  ) : msg.file_type === "audio" && msg.file_url ? (
                    <audio controls src={msg.file_url} className="w-full" />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Modern Input Box - single capsule */}
          <form
            className="w-full max-w-2xl flex justify-center mt-4"
            onSubmit={handleSend}
            autoComplete="off"
          >
            <div
              className="flex items-center w-full bg-[#232323] rounded-full px-3 py-2"
              style={{
                border: '2px solid #fff',
                boxShadow: '0 0 0 2px #fff2',
                minHeight: 56,
                transition: 'border 0.2s, box-shadow 0.2s',
                gap: 8,
              }}
            >
              {/* Gallery upload */}
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
                style={{ display: "none" }}
                onChange={e => handleFileChange(e, "image")}
              />
              {/* Text input */}
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#bdbdbd] font-normal text-base px-2"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.1rem', minHeight: 40, fontWeight: 400 }}
              />
              {/* Mic or Send button toggle */}
              {input.trim() === "" && !recording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
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
                  onClick={handleStopRecording}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-red-700 animate-pulse transition focus:outline-none"
                  title="Stop recording"
                  tabIndex={0}
                >
                  <Mic size={22} color="#fff" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

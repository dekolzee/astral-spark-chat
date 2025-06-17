
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Trash2, LogOut, Settings, Paperclip } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import FileUploader from '@/components/FileUploader';

export default function DekolzeeChatWindow() {
  const { sessions, activeSessionId, createSession, setActiveSession, sendMessage, deleteSession, getActiveSession, isLoading } = useChat();
  const { user, signOut } = useAuth();
  const [input, setInput] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; type: string; url: string; size: number }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = getActiveSession();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  useEffect(() => {
    if (sessions.length === 0) {
      createSession('Welcome to Dekolzee Bot');
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return;

    await sendMessage(input, attachments.length > 0 ? attachments : undefined);
    setInput('');
    setAttachments([]);
    setShowFileUpload(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const TypewriterText: React.FC<{ text: string; isStreaming: boolean }> = ({ text, isStreaming }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (!isStreaming) {
        setDisplayText(text);
        return;
      }

      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, 30);
        return () => clearTimeout(timer);
      }
    }, [text, currentIndex, isStreaming]);

    return (
      <span>
        {displayText}
        {isStreaming && currentIndex < text.length && (
          <span className="inline-block w-2 h-5 ml-1 bg-purple-500 animate-pulse" />
        )}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900">
      {/* Sidebar */}
      <motion.div
        className="w-80 bg-black/20 backdrop-blur-lg border-r border-gray-800 flex flex-col"
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">DB</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                Dekolzee Bot
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => createSession()}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Welcome, {user?.email}
          </div>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:bg-white/10 ${
                    activeSessionId === session.id ? 'bg-purple-500/20 border-purple-500/30' : 'bg-black/20 border-gray-800'
                  }`}
                  onClick={() => setActiveSession(session.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-white">{session.title}</p>
                        <p className="text-xs text-gray-400">
                          {session.messages.length} messages
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(session.updatedAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 bg-black/20 backdrop-blur-lg">
              <h2 className="font-semibold text-lg text-white">{activeSession.title}</h2>
              <p className="text-sm text-gray-400">
                {activeSession.messages.length} messages • AI-Powered Assistant
              </p>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                <AnimatePresence>
                  {activeSession.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="w-8 h-8 bg-gradient-to-r from-purple-500 to-teal-500">
                          <AvatarFallback className="text-white font-bold">DB</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        <Card className={`${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white ml-auto' 
                            : 'bg-black/40 backdrop-blur-lg border-gray-700 text-white'
                        }`}>
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="text-sm">
                                {message.role === 'assistant' ? (
                                  <TypewriterText 
                                    text={message.content} 
                                    isStreaming={message.streaming || false} 
                                  />
                                ) : (
                                  message.content
                                )}
                              </div>
                              
                              {/* Source Badge for AI messages */}
                              {message.role === 'assistant' && message.source && (
                                <div className="flex items-center gap-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    message.source === 'realtime' 
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                  }`}>
                                    {message.source === 'realtime' ? 'Real-Time AI' : 'Gemini AI'}
                                  </span>
                                </div>
                              )}
                              
                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center gap-2 p-2 bg-black/20 rounded border border-gray-600"
                                    >
                                      {attachment.type.startsWith('image/') ? (
                                        <img
                                          src={attachment.url}
                                          alt={attachment.name}
                                          className="w-16 h-16 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                                          <Paperclip className="w-4 h-4" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">
                                          {attachment.name}
                                        </p>
                                        <p className="text-xs opacity-70">
                                          {(attachment.size / 1024).toFixed(1)} KB
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <p className="text-xs opacity-70">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {message.role === 'user' && (
                        <Avatar className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-500">
                          <AvatarFallback className="text-white font-bold">U</AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* File Upload Area */}
            <AnimatePresence>
              {showFileUpload && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border-t border-gray-800 bg-black/20"
                >
                  <FileUploader
                    onFilesUploaded={(files) => {
                      setAttachments(prev => [...prev, ...files]);
                    }}
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attachments Preview */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border-t border-gray-800 bg-black/20"
                >
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-gray-600"
                      >
                        <span className="text-sm truncate max-w-32 text-white">
                          {attachment.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                          className="h-4 w-4 p-0 text-gray-400 hover:text-white"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800 bg-black/20 backdrop-blur-lg">
              <div className="flex gap-2 items-end max-w-4xl mx-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className={`h-10 w-10 p-0 ${showFileUpload ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Dekolzee Bot anything..."
                    className="pr-12 bg-black/40 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                    disabled={isLoading}
                  />
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  className="h-10 w-10 p-0 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">DB</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                Welcome to Dekolzee Bot
              </h2>
              <p className="text-gray-400">
                Your AI-powered assistant is ready to help
              </p>
              <Button 
                onClick={() => createSession()} 
                className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600"
              >
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

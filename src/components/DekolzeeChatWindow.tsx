
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Trash2, LogOut, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import FileUploader from '@/components/FileUploader';
import VoiceInterface from '@/components/VoiceInterface';

export default function DekolzeeChatWindow() {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<Array<{ id: string; name: string; type: string; url: string; size: number }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    sessions,
    activeSessionId,
    isLoading,
    createSession,
    setActiveSession,
    sendMessage,
    deleteSession,
    getActiveSession
  } = useChat();
  const { user, signOut } = useAuth();

  const activeSession = getActiveSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  const handleSendMessage = async () => {
    if (message.trim() || files.length > 0) {
      await sendMessage(message, files);
      setMessage('');
      setFiles([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceTranscription = (transcript: string) => {
    setMessage(transcript);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-black/20 backdrop-blur-lg border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">DB</span>
              </div>
              <div>
                <h2 className="text-white font-semibold">Dekolzee Bot</h2>
                <p className="text-gray-400 text-sm">
                  {user?.email || user?.user_metadata?.username || 'Guest User'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => createSession()}
            className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'hover:bg-gray-800/50'
                }`}
                onClick={() => setActiveSession(session.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{session.title}</p>
                  <p className="text-gray-400 text-xs">
                    {session.messages.length} messages • {formatTime(session.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 bg-black/20 backdrop-blur-lg">
              <h3 className="text-white font-semibold text-lg">{activeSession.title}</h3>
              <p className="text-gray-400 text-sm">
                AI-powered conversation • {activeSession.messages.length} messages
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {activeSession.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white'
                          : 'bg-gray-800/50 text-gray-100'
                      } rounded-lg p-4 shadow-lg`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs opacity-70">
                          {msg.role === 'user' ? 'You' : 'Dekolzee Bot'}
                          {msg.source && ` • ${msg.source}`}
                        </span>
                        <span className="text-xs opacity-50">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="whitespace-pre-wrap leading-relaxed"
                        >
                          {msg.content}
                        </motion.p>
                      </div>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.attachments.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-2 p-2 bg-black/20 rounded text-sm"
                            >
                              <span>📎</span>
                              <span className="truncate">{file.name}</span>
                              <span className="text-xs opacity-70">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800 bg-black/20 backdrop-blur-lg">
              {files.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-sm"
                    >
                      <span>📎</span>
                      <span className="text-white truncate max-w-32">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                        className="text-gray-400 hover:text-red-400 h-4 w-4 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message Dekolzee Bot..."
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 resize-none min-h-[44px]"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-2">
                  <FileUploader onFilesUploaded={setFiles} />
                  <VoiceInterface onTranscription={handleVoiceTranscription} />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || (!message.trim() && files.length === 0)}
                    className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">DB</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to Dekolzee Bot</h2>
              <p className="text-gray-400 mb-6">
                Your AI-powered assistant is ready to help. Start a new conversation to begin!
              </p>
              <Button
                onClick={() => createSession('Welcome Chat')}
                className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Chatting
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

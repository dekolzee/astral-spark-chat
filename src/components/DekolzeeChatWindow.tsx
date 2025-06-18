
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Trash2, LogOut, User, Bot, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import FileUploader from '@/components/FileUploader';
import VoiceInterface from '@/components/VoiceInterface';

export default function DekolzeeChatWindow() {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<Array<{ id: string; name: string; type: string; url: string; size: number }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (message.trim() || files.length > 0) {
      await sendMessage(message, files);
      setMessage('');
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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

  const removeFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex">
      {/* Compact Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-white font-medium text-sm">Dekolzee Bot</h2>
                <p className="text-gray-500 text-xs truncate">
                  {user?.email || user?.user_metadata?.username || 'Guest'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-7 w-7 p-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => createSession()}
            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm h-8"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                  activeSessionId === session.id
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveSession(session.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white font-medium truncate">{session.title}</p>
                  <p className="text-gray-500 text-xs">
                    {session.messages.length} messages
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
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
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <h3 className="text-gray-900 dark:text-white font-medium">{activeSession.title}</h3>
              <p className="text-gray-500 text-sm">
                Powered by Gemini AI • {activeSession.messages.length} messages
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {activeSession.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      } rounded-2xl px-4 py-2 shadow-sm`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed text-sm">
                        {msg.content}
                      </div>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.attachments.map((file) => (
                            <div key={file.id}>
                              {file.type.startsWith('image/') ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="max-w-full h-auto rounded-lg"
                                />
                              ) : (
                                <div className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded text-xs">
                                  <Paperclip className="w-3 h-3" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs opacity-70">
                          {msg.role === 'user' ? 'You' : 'Dekolzee Bot'}
                        </span>
                        <span className="text-xs opacity-50">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              {files.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="relative flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                    >
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <Paperclip className="w-4 h-4" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-500 h-4 w-4 p-0 absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message Dekolzee Bot... (Try asking about images or general questions!)"
                    className="min-h-[44px] max-h-[120px] resize-none bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl pr-12"
                    disabled={isLoading}
                    rows={1}
                  />
                </div>

                <div className="flex gap-1">
                  <FileUploader onFilesUploaded={setFiles} />
                  <VoiceInterface onTranscription={handleVoiceTranscription} />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || (!message.trim() && files.length === 0)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 w-11 p-0"
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
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">DB</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Dekolzee Bot</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your AI assistant powered by Google Gemini. Ask questions, upload images, or just have a conversation!
              </p>
              <Button
                onClick={() => createSession('Welcome Chat')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
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

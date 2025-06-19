
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Trash2, LogOut, User, Bot, Paperclip, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import FileUploader from '@/components/FileUploader';
import VoiceInterface from '@/components/VoiceInterface';
import UserProfile from '@/components/UserProfile';
import MessageReactions from '@/components/MessageReactions';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function DekolzeeChatWindow() {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<Array<{ id: string; name: string; type: string; url: string; size: number }>>([]);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { stop: stopSpeaking, isSpeaking } = useTextToSpeech();
  
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
  const lastAIMessage = activeSession?.messages
    .filter(msg => msg.role === 'assistant')
    .slice(-1)[0]?.content || '';

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

  const exportSession = () => {
    if (!activeSession) return;
    
    const sessionData = {
      title: activeSession.title,
      messages: activeSession.messages,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex">
      {/* Sidebar with Glass Effect */}
      <div className="w-64 glass border-r border-white/10 flex flex-col backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">DB</span>
              </div>
              <div>
                <h2 className="text-white font-semibold">Dekolzee Bot</h2>
                <p className="text-gray-300 text-xs truncate">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserProfile />
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Auto-speak toggle */}
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="auto-speak" className="text-sm text-gray-300">
              Auto-speak responses
            </Label>
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopSpeaking}
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <VolumeX className="w-3 h-3" />
                </Button>
              )}
              <Switch
                id="auto-speak"
                checked={autoSpeak}
                onCheckedChange={setAutoSpeak}
              />
            </div>
          </div>
          
          <Button
            onClick={() => createSession()}
            className="w-full gradient-primary hover:opacity-90 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  activeSessionId === session.id
                    ? 'bg-white/20 shadow-lg'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setActiveSession(session.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{session.title}</p>
                  <p className="text-gray-400 text-xs">
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
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 hover:bg-red-500/20 h-6 w-6 p-0"
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
            <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">{activeSession.title}</h3>
                  <p className="text-gray-400 text-sm">
                    Powered by Gemini AI • {activeSession.messages.length} messages
                  </p>
                </div>
                <Button
                  onClick={exportSession}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Export Chat
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {activeSession.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className="group relative">
                      <div
                        className={`max-w-2xl ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'glass text-white border border-white/10 shadow-lg'
                        } rounded-2xl px-6 py-4 backdrop-blur-sm`}
                      >
                        <div className="leading-relaxed">
                          {msg.role === 'assistant' ? (
                            <MarkdownRenderer content={msg.content} />
                          ) : (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          )}
                        </div>

                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {msg.attachments.map((file) => (
                              <div key={file.id}>
                                {file.type.startsWith('image/') ? (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="max-w-full h-auto rounded-xl shadow-lg"
                                  />
                                ) : (
                                  <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
                                    <Paperclip className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm truncate">{file.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                          <span className="text-xs text-gray-400">
                            {msg.role === 'user' ? 'You' : 'Dekolzee Bot'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <MessageReactions messageId={msg.id} />
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="glass rounded-2xl px-6 py-4 border border-white/10 shadow-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
              {files.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="relative flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/10"
                    >
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <Paperclip className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-white truncate max-w-32">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/20 h-6 w-6 p-0 absolute -top-2 -right-2 bg-gray-800 rounded-full shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="min-h-[52px] max-h-[120px] resize-none glass border-white/20 text-white placeholder:text-gray-400 rounded-2xl pr-4 shadow-lg backdrop-blur-sm"
                    disabled={isLoading}
                    rows={1}
                  />
                </div>

                <div className="flex gap-2">
                  <FileUploader onFilesUploaded={setFiles} />
                  <VoiceInterface 
                    onTranscription={handleVoiceTranscription}
                    autoSpeak={autoSpeak}
                    lastMessage={lastAIMessage}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || (!message.trim() && files.length === 0)}
                    className="gradient-secondary hover:opacity-90 text-white rounded-2xl h-12 w-12 p-0 shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-float">
                <span className="text-3xl font-bold text-white">DB</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 text-gradient">Welcome to Dekolzee Bot</h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Your advanced AI assistant powered by Google Gemini. Experience seamless conversations with voice commands, file uploads, and intelligent responses.
              </p>
              <Button
                onClick={() => createSession('Welcome Chat')}
                className="gradient-primary hover:opacity-90 text-white shadow-lg px-8 py-3 text-lg font-semibold rounded-2xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Chatting
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

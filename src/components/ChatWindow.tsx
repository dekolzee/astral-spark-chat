
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Settings, Plus, Trash2 } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import FileUploader from './FileUploader';
import ThemeSettings from './ThemeSettings';

const ChatWindow: React.FC = () => {
  const { state, createSession, setActiveSession, sendMessage, deleteSession, getActiveSession } = useChat();
  const [input, setInput] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; type: string; url: string; size: number }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = getActiveSession();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  useEffect(() => {
    if (state.sessions.length === 0) {
      createSession('Welcome Chat');
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
          <span className="inline-block w-2 h-5 ml-1 bg-primary animate-pulse" />
        )}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.div
        className="w-80 bg-card border-r border-border flex flex-col"
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-cyber font-bold text-gradient">AstralChat</h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThemeSettings(true)}
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => createSession()}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {state.sessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:bg-accent/10 ${
                    state.activeSessionId === session.id ? 'bg-primary/10 border-primary/30' : ''
                  }`}
                  onClick={() => setActiveSession(session.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.messages.length} messages
                        </p>
                        <p className="text-xs text-muted-foreground">
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
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
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
            <div className="p-4 border-b border-border bg-card/50 backdrop-blur">
              <h2 className="font-semibold text-lg">{activeSession.title}</h2>
              <p className="text-sm text-muted-foreground">
                {activeSession.messages.length} messages • Active session
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
                        <Avatar className="w-8 h-8 bg-gradient-to-r from-primary to-secondary">
                          <AvatarFallback className="text-white font-bold">AI</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        <Card className={`${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'neumorphic'
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
                              
                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center gap-2 p-2 bg-background/20 rounded border"
                                    >
                                      {attachment.type.startsWith('image/') ? (
                                        <img
                                          src={attachment.url}
                                          alt={attachment.name}
                                          className="w-16 h-16 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
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
                        <Avatar className="w-8 h-8 bg-gradient-to-r from-secondary to-accent">
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
                  className="p-4 border-t border-border bg-card/30"
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
                  className="p-4 border-t border-border bg-card/30"
                >
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 bg-background/50 rounded-lg p-2 border"
                      >
                        <span className="text-sm truncate max-w-32">
                          {attachment.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                          className="h-4 w-4 p-0"
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
            <div className="p-4 border-t border-border bg-card/50 backdrop-blur">
              <div className="flex gap-2 items-end max-w-4xl mx-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className={`h-10 w-10 p-0 ${showFileUpload ? 'bg-primary/20' : ''}`}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="pr-12 bg-background/50 backdrop-blur border-border/50 focus:border-primary/50"
                    disabled={state.isLoading}
                  />
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && attachments.length === 0) || state.isLoading}
                  className="h-10 w-10 p-0 gradient-primary hover:opacity-90 glow"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-2xl font-cyber font-bold text-white">AI</span>
              </div>
              <h2 className="text-2xl font-cyber font-bold text-gradient">
                Welcome to AstralChat
              </h2>
              <p className="text-muted-foreground">
                Start a new conversation to begin chatting with AI
              </p>
              <Button onClick={() => createSession()} className="gradient-primary">
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Theme Settings Modal */}
      <ThemeSettings
        isOpen={showThemeSettings}
        onClose={() => setShowThemeSettings(false)}
      />
    </div>
  );
};

export default ChatWindow;

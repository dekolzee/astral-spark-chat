
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ChatProvider } from '../contexts/ChatContext';
import LoadingScreen from '../components/LoadingScreen';
import ChatWindow from '../components/ChatWindow';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <ChatProvider>
        <div className="min-h-screen bg-background text-foreground">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <LoadingScreen key="loading" />
            ) : (
              <motion.div
                key="app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="h-screen"
              >
                <ChatWindow />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ChatProvider>
    </ThemeProvider>
  );
};

export default Index;

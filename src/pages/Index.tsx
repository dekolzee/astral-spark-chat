
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '../components/LoadingScreen';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // If user is authenticated, redirect to chat
  if (!loading && user) {
    return <Navigate to="/chat" replace />;
  }

  // Show loading screen during initialization
  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl"
      >
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl font-bold text-white">DB</span>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent mb-4">
            Dekolzee Bot
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your Next-Generation AI-Powered Assistant
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-black/20 backdrop-blur-lg rounded-lg p-6 border border-gray-800">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-gray-400 text-sm">Advanced AI models for intelligent conversations</p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-lg rounded-lg p-6 border border-gray-800">
            <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time</h3>
            <p className="text-gray-400 text-sm">Instant responses with streaming capabilities</p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-lg rounded-lg p-6 border border-gray-800">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
            <p className="text-gray-400 text-sm">End-to-end encryption and privacy protection</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white px-8 py-3 text-lg font-semibold shadow-2xl"
            onClick={() => window.location.href = '/auth'}
          >
            Get Started
          </Button>
          <p className="text-sm text-gray-400 mt-4">
            Join thousands of users already using Dekolzee Bot
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;

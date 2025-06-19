
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 bg-gray-800 border-gray-700 p-4 max-w-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">Install Dekolzee Chat</h3>
            <p className="text-gray-400 text-xs">Access quickly from your home screen</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPrompt(false)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleInstall}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm h-8"
        >
          <Download className="w-3 h-3 mr-1" />
          Install
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowPrompt(false)}
          className="text-gray-400 hover:text-white text-sm h-8"
        >
          Later
        </Button>
      </div>
    </Card>
  );
}

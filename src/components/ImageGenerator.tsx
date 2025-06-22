
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, X, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ImageGeneratorProps {
  onGenerate: (prompt: string) => void;
  onClose: () => void;
}

export default function ImageGenerator({ onGenerate, onClose }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt.trim());
      setPrompt('');
    }
  };

  const promptSuggestions = [
    'A futuristic city at sunset',
    'Abstract digital art with neon colors',
    'Peaceful mountain landscape',
    'Cyberpunk street scene',
    'Minimalist geometric patterns',
    'Fantasy forest with magical creatures'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm"
    >
      <Card className="glass border-white/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Image Generator</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="flex-1 glass border-white/20 text-white placeholder:text-gray-400"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!prompt.trim()}
              className="gradient-secondary hover:opacity-90 text-white"
            >
              <Image className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Inspiration:
          </p>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPrompt(suggestion);
                  onGenerate(suggestion);
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

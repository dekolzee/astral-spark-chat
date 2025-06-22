
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  onClose: () => void;
}

export default function SearchInterface({ onSearch, onClose }: SearchInterfaceProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  const quickSearches = [
    'Latest tech news',
    'Weather today',
    'Stock market updates',
    'Breaking news',
    'Science discoveries',
    'Crypto prices'
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
            <Globe className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Web Search</h3>
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web..."
              className="flex-1 glass border-white/20 text-white placeholder:text-gray-400"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!query.trim()}
              className="gradient-primary hover:opacity-90 text-white"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick searches:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((searchTerm) => (
              <Button
                key={searchTerm}
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery(searchTerm);
                  onSearch(searchTerm);
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
              >
                {searchTerm}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

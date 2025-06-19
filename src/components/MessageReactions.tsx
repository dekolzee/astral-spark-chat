
import React, { useState } from 'react';
import { Smile, Heart, ThumbsUp, Laugh } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageReactionsProps {
  messageId: string;
  reactions?: Record<string, number>;
  onReact: (messageId: string, emoji: string) => void;
}

const emojiOptions = [
  { emoji: '👍', icon: ThumbsUp, label: 'like' },
  { emoji: '❤️', icon: Heart, label: 'love' },
  { emoji: '😂', icon: Laugh, label: 'laugh' },
  { emoji: '😮', icon: Smile, label: 'wow' },
];

export default function MessageReactions({ messageId, reactions = {}, onReact }: MessageReactionsProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setShowReactions(!showReactions)}
      >
        <Smile className="w-3 h-3" />
      </Button>
      
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 bg-gray-800 dark:bg-gray-700 rounded-lg p-2 flex gap-1 shadow-lg">
          {emojiOptions.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(messageId, emoji);
                setShowReactions(false);
              }}
              className="hover:bg-gray-700 dark:hover:bg-gray-600 rounded p-1 text-lg"
              title={label}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      
      {Object.keys(reactions).length > 0 && (
        <div className="flex gap-1 mt-1">
          {Object.entries(reactions).map(([emoji, count]) => (
            <span
              key={emoji}
              className="text-xs bg-gray-700 dark:bg-gray-600 rounded-full px-2 py-1 flex items-center gap-1"
            >
              {emoji} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

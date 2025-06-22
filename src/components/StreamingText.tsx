
import React, { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface StreamingTextProps {
  content: string;
  speed?: number;
}

export default function StreamingText({ content, speed = 30 }: StreamingTextProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.substring(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [content, currentIndex, speed]);

  useEffect(() => {
    // Reset when content changes
    setDisplayedContent('');
    setCurrentIndex(0);
  }, [content]);

  return (
    <div className="relative">
      <MarkdownRenderer content={displayedContent} />
      {currentIndex < content.length && (
        <span className="animate-pulse text-blue-400">▊</span>
      )}
    </div>
  );
}

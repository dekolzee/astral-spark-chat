
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown parsing for basic formatting
  const parseMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 rounded text-sm">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 p-3 rounded-lg overflow-x-auto"><code>$1</code></pre>')
      .replace(/\n/g, '<br />');
  };

  // Auto-embed links
  const embedMedia = (text: string) => {
    // YouTube embed
    text = text.replace(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/g,
      '<div class="my-4"><iframe width="100%" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>'
    );
    
    // Twitter/X embed (simplified)
    text = text.replace(
      /https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/g,
      '<blockquote class="twitter-tweet bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500 my-4"><a href="$&">View Tweet</a></blockquote>'
    );
    
    return text;
  };

  const processedContent = embedMedia(parseMarkdown(content));

  return (
    <div 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

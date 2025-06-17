
import React from 'react';
import { ChatProvider } from '@/hooks/useChat';
import DekolzeeChatWindow from '@/components/DekolzeeChatWindow';

export default function Chat() {
  return (
    <ChatProvider>
      <DekolzeeChatWindow />
    </ChatProvider>
  );
}

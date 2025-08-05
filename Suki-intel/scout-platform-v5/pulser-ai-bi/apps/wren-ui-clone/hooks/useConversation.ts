import { useState } from 'react';

export function useConversation() {
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = (query: string) => {
    setHistory(prev => [query, ...prev].slice(0, 10));
  };

  return { history, addToHistory };
}

// Scout Platform v5 - RAG Chat UI Component
// Production-ready React component with real-time chat, context awareness, and data visualization

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Database, TrendingUp, FileText, Loader2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: Array<{
    id: string;
    title: string;
    content: string;
    confidence: number;
    metadata: Record<string, any>;
  }>;
  suggestions?: string[];
  metadata?: Record<string, any>;
}

interface RAGChatUIProps {
  userId: string;
  conversationId?: string;
  apiEndpoint?: string;
  theme?: 'light' | 'dark';
  showSources?: boolean;
  enableSuggestions?: boolean;
  maxHeight?: string;
  className?: string;
}

const RAGChatUI: React.FC<RAGChatUIProps> = ({
  userId,
  conversationId: initialConversationId,
  apiEndpoint = '/api/scout/rag-chat',
  theme = 'light',
  showSources = true,
  enableSuggestions = true,
  maxHeight = '600px',
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId || '');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize conversation
  useEffect(() => {
    if (!conversationId) {
      setConversationId(crypto.randomUUID());
    }
  }, [conversationId]);

  // Handle message sending
  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    setInputMessage('');
    setError(null);
    setIsLoading(true);
    setIsTyping(true);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          user_id: userId,
          conversation_id: conversationId,
          options: {
            includeHistory: true,
            maxSources: 5,
            temperature: 0.7,
            useSemanticSearch: true
          }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to get response');
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        sources: data.sources || [],
        suggestions: data.suggestions || [],
        metadata: data.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }

      console.error('Chat error:', error);
      setError(error.message || 'Failed to send message');
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // Copy message content
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Message feedback
  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    try {
      await fetch('/api/scout/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          feedback: feedback,
          user_id: userId
        })
      });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  // Render source card
  const SourceCard: React.FC<{ source: ChatMessage['sources'][0] }> = ({ source }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-medium text-blue-900 text-sm">{source.title}</h4>
        <div className="flex items-center space-x-1">
          {source.metadata.type === 'insight' && <Database className="w-3 h-3 text-blue-600" />}
          {source.metadata.type === 'knowledge' && <FileText className="w-3 h-3 text-blue-600" />}
          <span className="text-xs text-blue-600">
            {(source.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <p className="text-sm text-blue-800">{source.content}</p>
    </div>
  );

  // Render message
  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          {/* Message header */}
          <div className={`flex items-center space-x-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            {isUser && (
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* Message content */}
          <div className={`rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : isSystem 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-gray-100 text-gray-900'
          }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {/* Message actions */}
            {!isUser && !isSystem && (
              <div className="flex items-center justify-end space-x-2 mt-2 pt-2 border-t border-gray-300">
                <button
                  onClick={() => copyMessage(message.content)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleFeedback(message.id, 'positive')}
                  className="text-gray-500 hover:text-green-600 p-1"
                  title="Good response"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleFeedback(message.id, 'negative')}
                  className="text-gray-500 hover:text-red-600 p-1"
                  title="Poor response"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Sources */}
          {!isUser && showSources && message.sources && message.sources.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sources:</h4>
              {message.sources.map((source, idx) => (
                <SourceCard key={idx} source={source} />
              ))}
            </div>
          )}

          {/* Suggestions */}
          {!isUser && enableSuggestions && message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested follow-ups:</h4>
              <div className="flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'} ${className}`}>
      {/* Chat header */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Scout AI Assistant</h3>
            <p className="text-sm text-gray-500">Ask questions about your data and analytics</p>
          </div>
          {isTyping && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is typing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4" 
        style={{ maxHeight }}
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Scout AI</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Ask me anything about your data, analytics, or platform insights. 
              I can help you analyze trends, generate reports, and answer questions using your Scout Platform data.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Show me the latest campaign performance",
                "What are the top performing channels?",
                "Analyze user engagement trends",
                "Generate a monthly report summary"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Error display */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Scout AI anything about your data..."
              className={`w-full resize-none rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Character count */}
        <div className="mt-2 text-xs text-gray-500 text-right">
          {inputMessage.length}/2000 characters
        </div>
      </div>
    </div>
  );
};

export default RAGChatUI;
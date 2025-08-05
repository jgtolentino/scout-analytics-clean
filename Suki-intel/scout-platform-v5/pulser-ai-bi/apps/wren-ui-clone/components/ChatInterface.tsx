/**
 * Chat Interface Component - Natural language query input
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, X, ChevronDown } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useConversation } from '../hooks/useConversation';

interface ChatInterfaceProps {
  onQuery: (query: string) => void;
  isLoading?: boolean;
  suggestions?: string[];
  placeholder?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onQuery,
  isLoading = false,
  suggestions = [],
  placeholder = "Ask anything about your data..."
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { history, addToHistory } = useConversation();

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [query]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim() && !isLoading) {
      onQuery(query.trim());
      addToHistory(query.trim());
      setQuery('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setQuery(transcript);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };

  const exampleQueries = [
    "What's our total revenue this month?",
    "Show me sales trends for the last 6 months",
    "Compare performance across all regions",
    "Which campaigns have the highest ROI?",
    "What's the conversion rate by channel?"
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Chat Input Container */}
      <div 
        className={`
          relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg
          transition-all duration-200 border-2
          ${isFocused 
            ? 'border-blue-500 shadow-xl' 
            : 'border-gray-200 dark:border-gray-700'
          }
        `}
      >
        {/* AI Indicator */}
        <div className="absolute -top-3 left-4 px-2 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3 h-3" />
            <span className="font-medium">AI-Powered</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-end p-4">
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              // Delay to allow clicking suggestions
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={placeholder}
            className="
              flex-1 resize-none outline-none bg-transparent
              text-gray-900 dark:text-gray-100 placeholder-gray-400
              min-h-[24px] max-h-[120px] pr-4
            "
            rows={1}
            disabled={isLoading}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Voice Input */}
            <button
              onClick={startVoiceInput}
              disabled={isLoading || isListening}
              className={`
                p-2 rounded-lg transition-colors
                ${isListening
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Submit Button */}
            <button
              onClick={() => handleSubmit()}
              disabled={!query.trim() || isLoading}
              className={`
                p-2 rounded-lg transition-all
                ${query.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
              title="Send query"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Character Count */}
        {query.length > 100 && (
          <div className="absolute bottom-1 right-20 text-xs text-gray-400">
            {query.length}/500
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && !isLoading && (
        <div className="
          absolute top-full mt-2 w-full bg-white dark:bg-gray-800
          rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
          z-50 overflow-hidden
        ">
          {/* Recent Queries */}
          {history.length > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                RECENT
              </h4>
              {history.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  className="
                    block w-full text-left px-3 py-2 rounded-lg
                    text-sm text-gray-700 dark:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition-colors
                  "
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Example Queries */}
          <div className="p-3">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              TRY ASKING
            </h4>
            {exampleQueries.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(example)}
                className="
                  block w-full text-left px-3 py-2 rounded-lg
                  text-sm text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors group
                "
              >
                <span className="text-blue-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
                {example}
              </button>
            ))}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="px-3 pb-3 pt-1">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Press Enter to send</span>
              <span>Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute top-full mt-2 w-full">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
              </div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Analyzing your query...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
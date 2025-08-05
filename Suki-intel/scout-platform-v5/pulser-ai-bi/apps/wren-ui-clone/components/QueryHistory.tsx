import React, { useState } from 'react';
import { Clock, ChevronLeft } from 'lucide-react';

interface QueryHistoryProps {
  onSelectQuery: (query: string) => void;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({ onSelectQuery }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queries = [
    "Show total revenue this month",
    "Compare sales by region",
    "Top performing campaigns"
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-20 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        <Clock className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold">Query History</h3>
            <button onClick={() => setIsOpen(false)}>
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {queries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectQuery(query);
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

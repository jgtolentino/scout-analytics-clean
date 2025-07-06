import React from 'react';
import {
  PlusIcon,
  ViewColumnsIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

export const PointerHeader: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <header className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* macOS Traffic Lights Placeholder */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
      </div>

      {/* Center Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-sm font-mono uppercase tracking-widest text-gray-700">
          TBWA\MCP
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        <button className="header-icon-button" title="Add">
          <PlusIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button className="header-icon-button" title="View">
          <ViewColumnsIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button 
          className="header-icon-button" 
          title="Toggle theme"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? (
            <SunIcon className="w-4 h-4 text-gray-600" />
          ) : (
            <MoonIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
    </header>
  );
};
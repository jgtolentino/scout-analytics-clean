import React from 'react';
import { SparklesIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <SparklesIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Data Enricher</h1>
          <p className="text-sm text-gray-500">Campaign Intelligence Pipeline</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <QuestionMarkCircleIcon className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div className="ml-3 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
          U
        </div>
      </div>
    </header>
  );
};
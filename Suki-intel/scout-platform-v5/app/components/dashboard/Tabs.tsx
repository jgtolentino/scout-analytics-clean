'use client';

import React from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  id: string;
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  id,
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const [currentTab, setCurrentTab] = React.useState(activeTab || tabs[0]?.key || '');

  const handleTabClick = (tabKey: string) => {
    setCurrentTab(tabKey);
    onTabChange?.(tabKey);
  };

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`
              whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
              ${currentTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
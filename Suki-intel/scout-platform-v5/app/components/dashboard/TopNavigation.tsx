'use client';

import React from 'react';
import { Bell, Search, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopNavigationProps {
  id: string;
  label?: string;
  config?: any;
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    action?: string;
  }>;
  className?: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  id,
  label,
  config,
  actions,
  className
}) => {
  const [lastRefresh, setLastRefresh] = React.useState(new Date());

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Trigger data refresh
    window.location.reload();
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Title & Filters */}
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Last 30 Days</span>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Export Button */}
            <Button variant="primary" size="sm">
              Export Report
            </Button>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Last Updated:</span>
            <span className="text-gray-900 font-medium">
              {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Data Quality:</span>
            <span className="text-green-600 font-medium">98.5%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Active Filters:</span>
            <span className="text-gray-900 font-medium">None</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;

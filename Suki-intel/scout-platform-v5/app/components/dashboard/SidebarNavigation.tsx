'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  MapPin, 
  BarChart3, 
  MessageSquare,
  Settings,
  FileText,
  ChevronRight
} from 'lucide-react';

interface SidebarNavigationProps {
  id: string;
  label?: string;
  config?: {
    modules?: string[];
  };
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    action?: string;
  }>;
  className?: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: TrendingUp },
  { id: 'products', label: 'Product Mix', icon: ShoppingBag },
  { id: 'consumers', label: 'Consumer Insights', icon: Users },
  { id: 'geography', label: 'Geographic Analysis', icon: MapPin },
  { id: 'competitors', label: 'Competitive Analysis', icon: BarChart3 },
  { id: 'sentiment', label: 'Sentiment Analysis', icon: MessageSquare },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  id,
  label,
  config,
  actions,
  className
}) => {
  const [activeItem, setActiveItem] = React.useState('dashboard');

  return (
    <div className={`w-64 min-h-screen bg-gray-900 ${className}`}>
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Scout Platform v5</h1>
        <p className="text-sm text-gray-400 mt-1">Enterprise Analytics</p>
      </div>

      {/* Navigation Items */}
      <nav className="p-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <Users className="h-5 w-5 text-gray-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">admin@scout.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;
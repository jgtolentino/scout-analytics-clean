import React from 'react';
import {
  FolderOpenIcon,
  FolderPlusIcon,
  CalendarDaysIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

export const WorkspaceView: React.FC = () => {
  const currentWorkspace = '/Users/tbwa/mcp-workspace';
  
  const actionCards = [
    {
      id: 'open',
      icon: FolderOpenIcon,
      label: 'Open Workspace',
      action: () => console.log('Open workspace'),
    },
    {
      id: 'new',
      icon: FolderPlusIcon,
      label: 'New Workspace',
      action: () => console.log('New workspace'),
    },
    {
      id: 'window',
      icon: CalendarDaysIcon,
      label: 'New Window',
      action: () => console.log('New window'),
    },
  ];

  const recentWorkspaces = [
    {
      name: 'mcp-workspace',
      path: '/Users/tbwa/mcp-workspace',
    },
    {
      name: 'enrichment-engine',
      path: '/Users/tbwa/enrichment_engine',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8">
      <div className="max-w-4xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">M</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-wider">TBWA\MCP</h1>
          </div>
          <p className="text-gray-500 text-lg">AI Agent Workspace Platform</p>
        </div>

        {/* Action Cards */}
        <div className="flex justify-center gap-6 mb-8">
          {actionCards.map((card) => (
            <button
              key={card.id}
              onClick={card.action}
              className="action-card"
            >
              <card.icon className="w-8 h-8 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">{card.label}</span>
            </button>
          ))}
        </div>

        {/* Current Workspace */}
        <div className="flex justify-center mb-8">
          <div className="workspace-pill">
            <FolderIcon className="w-4 h-4 text-gray-600" />
            <span className="font-mono text-gray-700">{currentWorkspace}</span>
            <span className="current-badge">Current Workspace</span>
          </div>
        </div>

        {/* Recent Workspaces */}
        <div className="recent-workspace-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Recent Workspaces
            </h2>
            <a href="#" className="text-sm text-blue-500 hover:text-blue-600">
              View all ({recentWorkspaces.length})
            </a>
          </div>
          
          <div className="space-y-3">
            {recentWorkspaces.map((workspace, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded-lg cursor-pointer"
              >
                <span className="font-medium text-gray-900">{workspace.name}</span>
                <span className="font-mono text-sm text-gray-500">{workspace.path}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
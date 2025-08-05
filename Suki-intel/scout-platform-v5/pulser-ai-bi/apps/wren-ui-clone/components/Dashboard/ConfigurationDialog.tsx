/**
 * Configuration Dialog Component - Dashboard settings dialog
 */

import React, { useState } from 'react';
import { 
  X,
  Settings,
  Layout,
  Palette,
  Database,
  Filter,
  Save,
  Upload,
  Download,
  Grid,
  Square,
  Layers
} from 'lucide-react';

interface ConfigurationDialogProps {
  config: any;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

export const ConfigurationDialog: React.FC<ConfigurationDialogProps> = ({
  config,
  onUpdate,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'layout' | 'theme' | 'data'>('general');
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    onUpdate(localConfig);
    onClose();
  };

  const updateConfig = (path: string, value: any) => {
    setLocalConfig((prev: any) => {
      const keys = path.split('.');
      const newConfig = { ...prev };
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(localConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dashboard-config-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setLocalConfig(importedConfig);
      } catch (error) {
        console.error('Failed to import configuration:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dashboard Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'layout', label: 'Layout', icon: Layout },
            { id: 'theme', label: 'Theme', icon: Palette },
            { id: 'data', label: 'Data', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Dashboard Title</label>
                <input
                  type="text"
                  value={localConfig.title}
                  onChange={(e) => updateConfig('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={localConfig.description || ''}
                  onChange={(e) => updateConfig('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-24"
                  placeholder="Optional dashboard description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Auto-refresh Interval</label>
                <select
                  value={localConfig.refreshInterval || '0'}
                  onChange={(e) => updateConfig('refreshInterval', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="0">Disabled</option>
                  <option value="30000">30 seconds</option>
                  <option value="60000">1 minute</option>
                  <option value="300000">5 minutes</option>
                  <option value="600000">10 minutes</option>
                  <option value="1800000">30 minutes</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={exportConfig}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Configuration
                </button>
                
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Configuration
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Layout Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'grid', label: 'Grid', icon: Grid },
                    { id: 'freeform', label: 'Freeform', icon: Square },
                    { id: 'responsive', label: 'Responsive', icon: Layers }
                  ].map(layoutType => (
                    <button
                      key={layoutType.id}
                      onClick={() => updateConfig('layout.type', layoutType.id)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        localConfig.layout.type === layoutType.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <layoutType.icon className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm font-medium">{layoutType.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {localConfig.layout.type === 'grid' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Grid Columns</label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={localConfig.layout.columns}
                      onChange={(e) => updateConfig('layout.columns', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Grid Rows</label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={localConfig.layout.rows}
                      onChange={(e) => updateConfig('layout.rows', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Zone Gap (pixels)</label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  step="4"
                  value={localConfig.layout.gap}
                  onChange={(e) => updateConfig('layout.gap', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-500 mt-1">
                  {localConfig.layout.gap}px
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Color Scheme</label>
                <select
                  value={localConfig.theme.colorScheme}
                  onChange={(e) => updateConfig('theme.colorScheme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={localConfig.theme.primaryColor}
                    onChange={(e) => updateConfig('theme.primaryColor', e.target.value)}
                    className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.theme.primaryColor}
                    onChange={(e) => updateConfig('theme.primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={localConfig.theme.accentColor}
                    onChange={(e) => updateConfig('theme.accentColor', e.target.value)}
                    className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localConfig.theme.accentColor}
                    onChange={(e) => updateConfig('theme.accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select
                  value={localConfig.theme.fontFamily}
                  onChange={(e) => updateConfig('theme.fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="system-ui">System Default</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Data Source Connection</label>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Configure the default data source for all zones in this dashboard.
                  </p>
                  <select
                    value={localConfig.dataSource || 'supabase'}
                    onChange={(e) => updateConfig('dataSource', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="supabase">Supabase Database</option>
                    <option value="api">Custom API</option>
                    <option value="csv">CSV File</option>
                    <option value="json">JSON Data</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cache Settings</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localConfig.enableCache || false}
                      onChange={(e) => updateConfig('enableCache', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">Enable query result caching</span>
                  </label>
                  
                  {localConfig.enableCache && (
                    <div className="ml-6">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Cache Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={localConfig.cacheDuration || 5}
                        onChange={(e) => updateConfig('cacheDuration', parseInt(e.target.value))}
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Query Timeout (seconds)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={localConfig.queryTimeout || 30}
                  onChange={(e) => updateConfig('queryTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
/**
 * Dashboard Extension Component - Tableau-style extensible dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Filter, 
  Download, 
  Maximize2, 
  Grid,
  Plus,
  X,
  Move,
  Palette,
  Database,
  ChevronDown
} from 'lucide-react';
import { DashboardZone } from './DashboardZone';
import { ConfigurationDialog } from './ConfigurationDialog';
import { FilterPanel } from './FilterPanel';
import { ParameterControls } from './ParameterControls';
import { useDashboardState } from '../../hooks/useDashboardState';

export interface DashboardConfig {
  title: string;
  description?: string;
  version?: string;
  zones: DashboardZone[];
  parameters: Parameter[];
  filters: Filter[];
  theme: DashboardTheme;
  layout: LayoutConfig;
}

export interface DashboardZone {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'kpi' | 'filter' | 'parameter' | 'custom';
  position: { x: number; y: number; w: number; h: number };
  config: any;
  dataSource?: string;
}

export interface Parameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'list';
  value: any;
  allowableValues?: any[];
  required?: boolean;
}

export interface Filter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  applied: boolean;
}

export interface DashboardTheme {
  colorScheme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface LayoutConfig {
  type: 'grid' | 'freeform' | 'responsive';
  columns: number;
  rows: number;
  gap: number;
}

interface DashboardExtensionProps {
  initialConfig?: DashboardConfig;
  onSave?: (config: DashboardConfig) => void;
  onExport?: (format: string) => void;
  readOnly?: boolean;
}

export const DashboardExtension: React.FC<DashboardExtensionProps> = ({
  initialConfig,
  onSave,
  onExport,
  readOnly = false
}) => {
  const {
    config,
    updateConfig,
    addZone,
    removeZone,
    updateZone,
    applyFilter,
    updateParameter,
    undo,
    redo,
    canUndo,
    canRedo
  } = useDashboardState(initialConfig);

  const [showConfig, setShowConfig] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [draggedZone, setDraggedZone] = useState<string | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'e':
            e.preventDefault();
            setShowConfig(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleSave = () => {
    onSave?.(config);
  };

  const handleAddZone = (type: DashboardZone['type']) => {
    const newZone: DashboardZone = {
      id: `zone-${Date.now()}`,
      name: `New ${type} Zone`,
      type,
      position: { x: 0, y: 0, w: 4, h: 4 },
      config: {}
    };
    addZone(newZone);
  };

  const handleDragStart = (zoneId: string) => {
    setDraggedZone(zoneId);
  };

  const handleDragEnd = () => {
    setDraggedZone(null);
  };

  const handleDrop = (e: React.DragEvent, targetZoneId: string) => {
    e.preventDefault();
    if (draggedZone && draggedZone !== targetZoneId) {
      // Swap positions
      const sourceZone = config.zones.find(z => z.id === draggedZone);
      const targetZone = config.zones.find(z => z.id === targetZoneId);
      
      if (sourceZone && targetZone) {
        const tempPos = { ...sourceZone.position };
        updateZone(draggedZone, { position: targetZone.position });
        updateZone(targetZoneId, { position: tempPos });
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`dashboard-extension ${config.theme.colorScheme}`}>
      {/* Header Toolbar */}
      <div className="dashboard-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {config.title}
            </h1>
            {config.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {config.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Parameter Controls */}
            <ParameterControls
              parameters={config.parameters}
              onChange={updateParameter}
              compact
            />

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                config.filters.some(f => f.applied)
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Filters"
            >
              <Filter className="w-5 h-5" />
              {config.filters.filter(f => f.applied).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {config.filters.filter(f => f.applied).length}
                </span>
              )}
            </button>

            {!readOnly && (
              <>
                {/* Add Zone Menu */}
                <div className="relative group">
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Add Zone"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {(['chart', 'table', 'kpi', 'filter', 'parameter'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => handleAddZone(type)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors capitalize"
                      >
                        Add {type} Zone
                      </button>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <button
                  onClick={() => setShowConfig(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Dashboard Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* Undo/Redo */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Undo (Ctrl+Z)"
                  >
                    ↶
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    ↷
                  </button>
                </div>
              </>
            )}

            {/* Export Menu */}
            <div className="relative group">
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Export"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {['PDF', 'PNG', 'Excel', 'PowerPoint'].map(format => (
                  <button
                    key={format}
                    onClick={() => onExport?.(format.toLowerCase())}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Export as {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={config.filters}
          onApply={applyFilter}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Dashboard Grid */}
      <div 
        className="dashboard-grid p-4 bg-gray-50 dark:bg-gray-900 min-h-screen"
        style={{
          display: config.layout.type === 'grid' ? 'grid' : 'block',
          gridTemplateColumns: `repeat(${config.layout.columns}, 1fr)`,
          gridTemplateRows: `repeat(${config.layout.rows}, minmax(200px, 1fr))`,
          gap: `${config.layout.gap}px`
        }}
      >
        {config.zones.map(zone => (
          <DashboardZone
            key={zone.id}
            zone={zone}
            isSelected={selectedZone === zone.id}
            onSelect={() => setSelectedZone(zone.id)}
            onUpdate={(updates) => updateZone(zone.id, updates)}
            onRemove={() => removeZone(zone.id)}
            onDragStart={() => handleDragStart(zone.id)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, zone.id)}
            readOnly={readOnly}
            parameters={config.parameters}
            filters={config.filters.filter(f => f.applied)}
          />
        ))}

        {/* Empty State */}
        {config.zones.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <Grid className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No zones added yet</h3>
            <p className="text-sm mb-4">Start building your dashboard by adding zones</p>
            {!readOnly && (
              <button
                onClick={() => handleAddZone('chart')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Zone
              </button>
            )}
          </div>
        )}
      </div>

      {/* Configuration Dialog */}
      {showConfig && (
        <ConfigurationDialog
          config={config}
          onUpdate={updateConfig}
          onClose={() => setShowConfig(false)}
        />
      )}

      {/* Save Indicator */}
      {!readOnly && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Save Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
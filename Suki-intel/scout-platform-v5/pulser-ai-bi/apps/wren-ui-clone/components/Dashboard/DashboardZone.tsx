/**
 * Dashboard Zone Component - Individual zone within the dashboard
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Move, 
  Settings, 
  X, 
  Maximize2, 
  Minimize2,
  MoreVertical,
  RefreshCw,
  Link2,
  Copy
} from 'lucide-react';
import { ChartCanvas } from '../ChartCanvas';
import { ResultTable } from '../ResultTable';
import { KPICard } from './KPICard';
import { FilterZone } from './FilterZone';
import { ParameterZone } from './ParameterZone';
import { useAnalytics } from '../../hooks/useAnalytics';

interface DashboardZoneProps {
  zone: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  readOnly?: boolean;
  parameters?: any[];
  filters?: any[];
}

export const DashboardZone: React.FC<DashboardZoneProps> = ({
  zone,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  onDrop,
  readOnly = false,
  parameters = [],
  filters = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const { execute, result, isLoading, error } = useAnalytics();

  // Handle zone-specific data fetching
  useEffect(() => {
    if (zone.dataSource && zone.config.query) {
      refreshData();
    }
  }, [zone.dataSource, zone.config.query, parameters, filters]);

  const refreshData = async () => {
    if (!zone.config.query) return;
    
    setIsRefreshing(true);
    try {
      // Apply parameters and filters to query
      let processedQuery = zone.config.query;
      
      // Replace parameter placeholders
      parameters.forEach(param => {
        processedQuery = processedQuery.replace(
          new RegExp(`{{${param.name}}}`, 'g'),
          param.value
        );
      });

      // Execute query
      await execute(processedQuery);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResize = (direction: 'expand' | 'collapse') => {
    if (direction === 'expand') {
      onUpdate({
        position: {
          ...zone.position,
          w: Math.min(zone.position.w + 2, 12),
          h: Math.min(zone.position.h + 2, 8)
        }
      });
    } else {
      onUpdate({
        position: {
          ...zone.position,
          w: Math.max(zone.position.w - 2, 2),
          h: Math.max(zone.position.h - 2, 2)
        }
      });
    }
  };

  const copyZoneLink = () => {
    const link = `${window.location.origin}/dashboard/zone/${zone.id}`;
    navigator.clipboard.writeText(link);
    // Show toast notification
  };

  const renderZoneContent = () => {
    switch (zone.type) {
      case 'chart':
        if (!result || isLoading) {
          return (
            <div className="flex items-center justify-center h-full">
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              ) : (
                <span className="text-gray-400">No data</span>
              )}
            </div>
          );
        }
        return (
          <ChartCanvas
            config={zone.config.chartConfig || result.chartConfig}
            type={zone.config.chartType || result.chartType || 'bar'}
            title={zone.name}
            isLoading={isRefreshing}
            onRefresh={refreshData}
            className="h-full"
          />
        );

      case 'table':
        if (!result) return <div className="text-center text-gray-400">No data</div>;
        return (
          <ResultTable
            data={result.data}
            columns={result.columns}
            title={zone.name}
          />
        );

      case 'kpi':
        return (
          <KPICard
            title={zone.name}
            value={zone.config.value || result?.data?.[0]?.value || 0}
            change={zone.config.change}
            format={zone.config.format}
            target={zone.config.target}
            sparklineData={zone.config.sparklineData}
          />
        );

      case 'filter':
        return (
          <FilterZone
            filters={zone.config.filters || []}
            onApply={(updatedFilters) => {
              onUpdate({ config: { ...zone.config, filters: updatedFilters } });
            }}
          />
        );

      case 'parameter':
        return (
          <ParameterZone
            parameters={zone.config.parameters || []}
            onChange={(paramId, value) => {
              const updatedParams = zone.config.parameters.map((p: any) =>
                p.id === paramId ? { ...p, value } : p
              );
              onUpdate({ config: { ...zone.config, parameters: updatedParams } });
            }}
          />
        );

      case 'custom':
        return (
          <div className="p-4">
            <div className="text-sm text-gray-500">Custom content area</div>
            {zone.config.content && (
              <div dangerouslySetInnerHTML={{ __html: zone.config.content }} />
            )}
          </div>
        );

      default:
        return <div className="text-center text-gray-400">Unknown zone type</div>;
    }
  };

  return (
    <div
      ref={zoneRef}
      className={`
        dashboard-zone relative bg-white dark:bg-gray-800 rounded-lg shadow-lg
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isExpanded ? 'fixed inset-4 z-50' : ''}
        transition-all duration-200
      `}
      style={!isExpanded ? {
        gridColumn: `span ${zone.position.w}`,
        gridRow: `span ${zone.position.h}`
      } : {}}
      onClick={onSelect}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Zone Header */}
      <div className="zone-header flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              className="drag-handle cursor-move p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              draggable
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              title="Drag to reorder"
            >
              <Move className="w-4 h-4" />
            </button>
          )}
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {zone.name}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {/* Refresh Button */}
          {zone.dataSource && (
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Zone Menu */}
          <div className="relative group">
            <button
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Zone options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {!readOnly && (
                <>
                  <button
                    onClick={() => setIsConfiguring(true)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>
                  <button
                    onClick={() => handleResize('expand')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Make larger
                  </button>
                  <button
                    onClick={() => handleResize('collapse')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Make smaller
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                </>
              )}
              <button
                onClick={copyZoneLink}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Copy link
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(zone))}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy configuration
              </button>
              {!readOnly && (
                <>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={onRemove}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Remove zone
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zone Content */}
      <div className="zone-content p-4 h-[calc(100%-3rem)] overflow-auto">
        {error ? (
          <div className="text-red-600 dark:text-red-400 text-sm">
            Error: {error}
          </div>
        ) : (
          renderZoneContent()
        )}
      </div>

      {/* Configuration Modal */}
      {isConfiguring && (
        <ZoneConfiguration
          zone={zone}
          onUpdate={(updates) => {
            onUpdate(updates);
            setIsConfiguring(false);
          }}
          onClose={() => setIsConfiguring(false)}
        />
      )}
    </div>
  );
};

// Zone Configuration Component
const ZoneConfiguration: React.FC<{
  zone: any;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}> = ({ zone, onUpdate, onClose }) => {
  const [config, setConfig] = useState(zone.config);
  const [name, setName] = useState(zone.name);

  const handleSave = () => {
    onUpdate({
      name,
      config
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Configure Zone</h2>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Zone Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Zone Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          {/* Zone-specific configuration */}
          {zone.type === 'chart' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Chart Type</label>
                <select
                  value={config.chartType || 'bar'}
                  onChange={(e) => setConfig({ ...config, chartType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="area">Area Chart</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Query</label>
                <textarea
                  value={config.query || ''}
                  onChange={(e) => setConfig({ ...config, query: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-32"
                  placeholder="Enter your natural language query..."
                />
              </div>
            </>
          )}

          {zone.type === 'kpi' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">KPI Query</label>
                <input
                  type="text"
                  value={config.query || ''}
                  onChange={(e) => setConfig({ ...config, query: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  placeholder="e.g., Total revenue this month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <select
                  value={config.format || 'number'}
                  onChange={(e) => setConfig({ ...config, format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="number">Number</option>
                  <option value="currency">Currency</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Value</label>
                <input
                  type="number"
                  value={config.target || ''}
                  onChange={(e) => setConfig({ ...config, target: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  placeholder="Optional target value"
                />
              </div>
            </>
          )}

          {zone.type === 'custom' && (
            <div>
              <label className="block text-sm font-medium mb-2">Custom HTML Content</label>
              <textarea
                value={config.content || ''}
                onChange={(e) => setConfig({ ...config, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg h-48"
                placeholder="Enter HTML content..."
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
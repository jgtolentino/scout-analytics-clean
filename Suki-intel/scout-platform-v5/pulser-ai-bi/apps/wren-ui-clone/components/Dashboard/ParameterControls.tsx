/**
 * Parameter Controls Component - Global parameter controls for dashboard
 */

import React, { useState } from 'react';
import { 
  Settings2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Save,
  X
} from 'lucide-react';

interface ParameterControlsProps {
  parameters: any[];
  onChange: (paramId: string, value: any) => void;
  compact?: boolean;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  parameters,
  onChange,
  compact = false
}) => {
  const [expanded, setExpanded] = useState(!compact);
  const [localParams, setLocalParams] = useState(parameters);
  const [hasChanges, setHasChanges] = useState(false);

  const updateParameter = (paramId: string, value: any) => {
    setLocalParams(prev => prev.map(p => 
      p.id === paramId ? { ...p, value } : p
    ));
    setHasChanges(true);
  };

  const applyChanges = () => {
    localParams.forEach(param => {
      onChange(param.id, param.value);
    });
    setHasChanges(false);
  };

  const resetChanges = () => {
    setLocalParams(parameters);
    setHasChanges(false);
  };

  if (parameters.length === 0) {
    return null;
  }

  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <Settings2 className="w-4 h-4" />
        <span className="text-sm font-medium">Parameters</span>
        {parameters.filter(p => p.value !== p.defaultValue).length > 0 && (
          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
            {parameters.filter(p => p.value !== p.defaultValue).length}
          </span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>
    );
  }

  const renderParameterControl = (param: any) => {
    switch (param.type) {
      case 'string':
        return (
          <input
            type="text"
            value={param.value || ''}
            onChange={(e) => updateParameter(param.id, e.target.value)}
            placeholder={param.placeholder || `Enter ${param.name}...`}
            className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={param.value || ''}
            onChange={(e) => updateParameter(param.id, e.target.value ? Number(e.target.value) : null)}
            min={param.min}
            max={param.max}
            step={param.step}
            className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={param.value || ''}
            onChange={(e) => updateParameter(param.id, e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={param.value || false}
              onChange={(e) => updateParameter(param.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">{param.value ? 'Enabled' : 'Disabled'}</span>
          </label>
        );

      case 'list':
        return (
          <select
            value={param.value || ''}
            onChange={(e) => updateParameter(param.id, e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
          >
            <option value="">Select...</option>
            {param.allowableValues?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`parameter-controls ${
      compact 
        ? 'absolute top-16 right-4 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80'
        : 'bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          <h3 className="text-sm font-semibold">Parameters</h3>
        </div>
        {compact && (
          <button
            onClick={() => setExpanded(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {localParams.map(param => (
          <div key={param.id}>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {param.name}
              {param.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {renderParameterControl(param)}
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={resetChanges}
            className="flex-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-sm flex items-center justify-center gap-1"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={applyChanges}
            className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
          >
            <Save className="w-3 h-3" />
            Apply
          </button>
        </div>
      )}

      {parameters.some(p => p.description) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tip: Hover over parameter names to see descriptions
          </p>
        </div>
      )}
    </div>
  );
};
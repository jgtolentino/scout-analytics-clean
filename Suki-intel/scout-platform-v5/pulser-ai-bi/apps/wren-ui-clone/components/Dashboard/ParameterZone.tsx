/**
 * Parameter Zone Component - Zone-specific parameter controls
 */

import React from 'react';
import { 
  Settings2,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  ToggleRight,
  List,
  HelpCircle
} from 'lucide-react';

interface ParameterConfig {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'list';
  value: any;
  defaultValue?: any;
  allowableValues?: Array<{ value: any; label: string }>;
  required?: boolean;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface ParameterZoneProps {
  parameters: ParameterConfig[];
  onChange: (paramId: string, value: any) => void;
  showLabels?: boolean;
  columns?: number;
}

export const ParameterZone: React.FC<ParameterZoneProps> = ({
  parameters,
  onChange,
  showLabels = true,
  columns = 1
}) => {
  const renderParameterControl = (param: ParameterConfig) => {
    switch (param.type) {
      case 'string':
        return (
          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={param.value || ''}
              onChange={(e) => onChange(param.id, e.target.value)}
              placeholder={`Enter ${param.label.toLowerCase()}...`}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
        );

      case 'number':
        return (
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={param.value || ''}
              onChange={(e) => onChange(param.id, e.target.value ? Number(e.target.value) : null)}
              min={param.min}
              max={param.max}
              step={param.step}
              placeholder={`Enter ${param.label.toLowerCase()}...`}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
            />
            {(param.min !== undefined || param.max !== undefined) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {param.min !== undefined && param.max !== undefined 
                  ? `${param.min}-${param.max}`
                  : param.min !== undefined 
                  ? `≥${param.min}`
                  : `≤${param.max}`}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={param.value || ''}
              onChange={(e) => onChange(param.id, e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
        );

      case 'boolean':
        return (
          <button
            onClick={() => onChange(param.id, !param.value)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              param.value 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {param.value ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {param.value ? 'Enabled' : 'Disabled'}
            </span>
          </button>
        );

      case 'list':
        if (!param.allowableValues || param.allowableValues.length === 0) {
          return <div className="text-sm text-gray-500">No options available</div>;
        }

        // Radio buttons for fewer options
        if (param.allowableValues.length <= 4) {
          return (
            <div className="space-y-2">
              {param.allowableValues.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name={param.id}
                    value={option.value}
                    checked={param.value === option.value}
                    onChange={() => onChange(param.id, option.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          );
        }

        // Dropdown for more options
        return (
          <div className="relative">
            <List className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={param.value || ''}
              onChange={(e) => onChange(param.id, e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors appearance-none"
            >
              <option value="">Select {param.label}...</option>
              {param.allowableValues.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="parameter-zone">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold">Parameters</h3>
      </div>

      <div 
        className={`grid gap-4`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {parameters.map(param => (
          <div key={param.id} className="space-y-2">
            {showLabels && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {param.label}
                  {param.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {param.description && (
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
                    <div className="absolute right-0 bottom-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      {param.description}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {renderParameterControl(param)}
            
            {param.defaultValue !== undefined && param.value !== param.defaultValue && (
              <button
                onClick={() => onChange(param.id, param.defaultValue)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Reset to default
              </button>
            )}
          </div>
        ))}
      </div>

      {parameters.some(p => p.required && !p.value) && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please fill in all required parameters marked with *
          </p>
        </div>
      )}
    </div>
  );
};
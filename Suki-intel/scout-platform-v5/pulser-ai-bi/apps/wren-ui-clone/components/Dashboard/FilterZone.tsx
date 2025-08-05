/**
 * Filter Zone Component - Zone-specific filter controls
 */

import React, { useState } from 'react';
import { 
  Filter,
  Calendar,
  Search,
  X,
  ChevronDown,
  Check
} from 'lucide-react';

interface FilterConfig {
  id: string;
  field: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'search';
  options?: Array<{ value: string; label: string }>;
  value?: any;
  operator?: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
}

interface FilterZoneProps {
  filters: FilterConfig[];
  onApply: (filters: FilterConfig[]) => void;
  compactMode?: boolean;
}

export const FilterZone: React.FC<FilterZoneProps> = ({
  filters: initialFilters,
  onApply,
  compactMode = false
}) => {
  const [filters, setFilters] = useState<FilterConfig[]>(initialFilters);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const updateFilter = (filterId: string, updates: Partial<FilterConfig>) => {
    setFilters(prev => prev.map(f => 
      f.id === filterId ? { ...f, ...updates } : f
    ));
  };

  const clearFilter = (filterId: string) => {
    setFilters(prev => prev.map(f => 
      f.id === filterId ? { ...f, value: undefined } : f
    ));
  };

  const handleApply = () => {
    onApply(filters);
  };

  const renderFilterControl = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'select':
        return (
          <div className="relative">
            <button
              onClick={() => setExpandedFilter(expandedFilter === filter.id ? null : filter.id)}
              className="w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <span className="text-sm">
                {filter.value 
                  ? filter.options?.find(o => o.value === filter.value)?.label || filter.value
                  : 'Select...'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {expandedFilter === filter.id && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filter.options?.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateFilter(filter.id, { value: option.value });
                      setExpandedFilter(null);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    <span className="text-sm">{option.label}</span>
                    {filter.value === option.value && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'multiselect':
        const selectedValues = filter.value || [];
        return (
          <div className="relative">
            <button
              onClick={() => setExpandedFilter(expandedFilter === filter.id ? null : filter.id)}
              className="w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <span className="text-sm">
                {selectedValues.length > 0 
                  ? `${selectedValues.length} selected`
                  : 'Select...'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {expandedFilter === filter.id && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filter.options?.map(option => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        const newValues = isSelected
                          ? selectedValues.filter((v: string) => v !== option.value)
                          : [...selectedValues, option.value];
                        updateFilter(filter.id, { value: newValues });
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <span className="text-sm">{option.label}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'range':
        const [min, max] = filter.value || [null, null];
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={min || ''}
              onChange={(e) => updateFilter(filter.id, { 
                value: [e.target.value ? Number(e.target.value) : null, max] 
              })}
              placeholder="Min"
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={max || ''}
              onChange={(e) => updateFilter(filter.id, { 
                value: [min, e.target.value ? Number(e.target.value) : null] 
              })}
              placeholder="Max"
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            />
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              value={filter.value || ''}
              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
              className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'search':
        return (
          <div className="relative">
            <input
              type="text"
              value={filter.value || ''}
              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
              placeholder="Search..."
              className="w-full px-3 py-2 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        );

      default:
        return null;
    }
  };

  if (compactMode) {
    return (
      <div className="filter-zone-compact flex flex-wrap gap-2">
        {filters.map(filter => (
          <div key={filter.id} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{filter.label}:</span>
            {renderFilterControl(filter)}
            {filter.value && (
              <button
                onClick={() => clearFilter(filter.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleApply}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply
        </button>
      </div>
    );
  }

  return (
    <div className="filter-zone space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>

      {filters.map(filter => (
        <div key={filter.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {filter.label}
            </label>
            {filter.value && (
              <button
                onClick={() => clearFilter(filter.id)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          {renderFilterControl(filter)}
        </div>
      ))}

      <button
        onClick={handleApply}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Apply Filters
      </button>
    </div>
  );
};
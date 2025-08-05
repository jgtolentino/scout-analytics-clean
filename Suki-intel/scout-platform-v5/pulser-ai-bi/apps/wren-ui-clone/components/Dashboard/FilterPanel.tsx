/**
 * Filter Panel Component - Global filter panel for dashboard
 */

import React, { useState } from 'react';
import { 
  X,
  Filter,
  Plus,
  Trash2,
  ChevronDown,
  Check,
  Calendar,
  Search
} from 'lucide-react';

interface FilterPanelProps {
  filters: any[];
  onApply: (filterId: string, value: any) => void;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onApply,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const availableFields = [
    { field: 'date', label: 'Date', type: 'date' },
    { field: 'category', label: 'Category', type: 'select', options: ['Electronics', 'Clothing', 'Food', 'Home'] },
    { field: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Pending'] },
    { field: 'amount', label: 'Amount', type: 'range' },
    { field: 'region', label: 'Region', type: 'multiselect', options: ['North', 'South', 'East', 'West'] },
    { field: 'search', label: 'Search', type: 'search' }
  ];

  const addFilter = () => {
    const newFilter = {
      id: `filter-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: null,
      applied: false
    };
    setLocalFilters([...localFilters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setLocalFilters(localFilters.filter(f => f.id !== filterId));
  };

  const updateFilter = (filterId: string, updates: any) => {
    setLocalFilters(localFilters.map(f => 
      f.id === filterId ? { ...f, ...updates } : f
    ));
  };

  const applyFilters = () => {
    localFilters.forEach(filter => {
      if (filter.field && filter.value !== null && filter.value !== '') {
        onApply(filter.id, { ...filter, applied: true });
      }
    });
    onClose();
  };

  const clearAllFilters = () => {
    setLocalFilters(localFilters.map(f => ({ ...f, value: null, applied: false })));
  };

  const renderFilterValue = (filter: any) => {
    const fieldConfig = availableFields.find(f => f.field === filter.field);
    if (!fieldConfig) return null;

    switch (fieldConfig.type) {
      case 'select':
        return (
          <div className="relative">
            <button
              onClick={() => setExpandedField(expandedField === filter.id ? null : filter.id)}
              className="w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between"
            >
              <span className="text-sm">
                {filter.value || 'Select...'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {expandedField === filter.id && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                {fieldConfig.options?.map((option: string) => (
                  <button
                    key={option}
                    onClick={() => {
                      updateFilter(filter.id, { value: option });
                      setExpandedField(null);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between"
                  >
                    <span className="text-sm">{option}</span>
                    {filter.value === option && <Check className="w-4 h-4 text-blue-600" />}
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
              onClick={() => setExpandedField(expandedField === filter.id ? null : filter.id)}
              className="w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between"
            >
              <span className="text-sm">
                {selectedValues.length > 0 ? `${selectedValues.length} selected` : 'Select...'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {expandedField === filter.id && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                {fieldConfig.options?.map((option: string) => {
                  const isSelected = selectedValues.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        const newValues = isSelected
                          ? selectedValues.filter((v: string) => v !== option)
                          : [...selectedValues, option];
                        updateFilter(filter.id, { value: newValues });
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between"
                    >
                      <span className="text-sm">{option}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
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
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={max || ''}
              onChange={(e) => updateFilter(filter.id, { 
                value: [min, e.target.value ? Number(e.target.value) : null] 
              })}
              placeholder="Max"
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
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
              className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
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
              className="w-full px-3 py-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        );

      default:
        return null;
    }
  };

  const activeFiltersCount = localFilters.filter(f => f.applied && f.value).length;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filters List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localFilters.map((filter, index) => (
          <div 
            key={filter.id} 
            className={`p-4 rounded-lg border ${
              filter.applied 
                ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <select
                value={filter.field}
                onChange={(e) => updateFilter(filter.id, { field: e.target.value, value: null })}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="">Select field...</option>
                {availableFields.map(field => (
                  <option key={field.field} value={field.field}>
                    {field.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>

            {filter.field && (
              <div>
                <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                  className="w-full px-3 py-1.5 mb-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="greater">Greater than</option>
                  <option value="less">Less than</option>
                  <option value="between">Between</option>
                  <option value="in">In</option>
                </select>

                {renderFilterValue(filter)}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addFilter}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
        >
          <Plus className="w-4 h-4" />
          Add Filter
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <button
          onClick={clearAllFilters}
          className="w-full py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Clear All Filters
        </button>
        <button
          onClick={applyFilters}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
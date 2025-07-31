'use client';

import React from 'react';
import { getComponent, getMissingComponents } from './component-registry';

interface DashboardRendererProps {
  schema: any;
  activeTab?: string;
  className?: string;
}

export const DashboardRenderer: React.FC<DashboardRendererProps> = ({
  schema,
  activeTab = 'store_analytics',
  className
}) => {
  const [missingComponents, setMissingComponents] = React.useState<string[]>([]);

  React.useEffect(() => {
    const missing = getMissingComponents(schema);
    setMissingComponents(missing);
    
    if (missing.length > 0) {
      console.warn('Missing components:', missing);
    }
  }, [schema]);

  const renderComponent = (componentConfig: any) => {
    const Component = getComponent(componentConfig.type);
    
    if (!Component) {
      return (
        <div
          key={componentConfig.id}
          className="p-4 border-2 border-dashed border-yellow-400 bg-yellow-50 rounded-lg"
        >
          <div className="text-center">
            <div className="text-yellow-600 font-medium">
              Missing Component: {componentConfig.type}
            </div>
            <div className="text-sm text-yellow-500 mt-1">
              Component "{componentConfig.type}" needs to be implemented
            </div>
            <div className="text-xs text-gray-500 mt-2">
              ID: {componentConfig.id}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <Component
        key={componentConfig.id}
        {...componentConfig}
      />
    );
  };

  const renderSection = (section: any) => {
    // Handle tab visibility
    if (section.visible_when?.tab && section.visible_when.tab !== activeTab) {
      return null;
    }

    const sectionClasses = {
      'kpi_metrics': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
      'store_analytics': 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6',
      'brand_monitoring': 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6',
      'ai_insights': 'space-y-4 mb-6',
      'navigation': 'mb-6'
    };

    return (
      <div
        key={section.key}
        className={sectionClasses[section.key as keyof typeof sectionClasses] || 'space-y-4 mb-6'}
      >
        {section.title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-4 col-span-full">
            {section.title}
          </h2>
        )}
        
        {section.components?.map(renderComponent)}
        
        {section.tabs && (
          <div className="flex space-x-4 border-b border-gray-200">
            {section.tabs.map((tab: any) => (
              <button
                key={tab.id}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  tab.active || tab.id === activeTab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Development Warning for Missing Components */}
      {process.env.NODE_ENV === 'development' && missingComponents.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <div className="flex items-center">
            <div className="text-yellow-800">
              <strong>Development Warning:</strong> {missingComponents.length} component(s) need implementation
            </div>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            Missing: {missingComponents.join(', ')}
          </div>
          <div className="mt-2 text-xs text-yellow-600">
            Run <code>npm run patch:components</code> to generate scaffolds
          </div>
        </div>
      )}

      {/* Render Dashboard Sections */}
      {schema.sections?.map(renderSection)}
    </div>
  );
};

export default DashboardRenderer;
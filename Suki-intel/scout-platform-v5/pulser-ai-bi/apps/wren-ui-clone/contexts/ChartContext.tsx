/**
 * ChartContext
 * Provides chart metadata and data to child components
 */

import React, { createContext, useContext, ReactNode } from 'react';

export interface ChartContextValue {
  chartId: string;
  chartType: string;
  data: any[];
  title?: string;
  filters?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  };
  metadata?: Record<string, any>;
}

const ChartContext = createContext<ChartContextValue | undefined>(undefined);

interface ChartProviderProps {
  children: ReactNode;
  value: ChartContextValue;
}

export const ChartProvider: React.FC<ChartProviderProps> = ({ children, value }) => {
  return (
    <ChartContext.Provider value={value}>
      {children}
    </ChartContext.Provider>
  );
};

export const useChartContext = (): ChartContextValue => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChartContext must be used within a ChartProvider');
  }
  return context;
};
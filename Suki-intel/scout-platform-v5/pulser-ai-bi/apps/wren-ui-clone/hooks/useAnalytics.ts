/**
 * Analytics Hook - Main interface for natural language analytics
 */

import { useState, useCallback, useRef } from 'react';
import { useSupabase } from './useSupabase';
import { ChartType } from '../components/Charts';

// Local type definition
interface ChartConfig {
  data: any[];
  theme?: string;
  options: any;
}

interface AnalyticsResult {
  query: string;
  sql: string;
  intent: any;
  entities: any[];
  confidence: number;
  explanation: string;
  data: any[];
  columns: any[];
  chartType: ChartType;
  chartConfig: ChartConfig;
  suggestions: string[];
  executionTime: number;
  error?: string;
}

interface UseAnalyticsReturn {
  query: string;
  execute: (naturalLanguageQuery: string) => Promise<void>;
  isLoading: boolean;
  result: AnalyticsResult | null;
  error: string | null;
  chartConfig: ChartConfig | null;
  chartType: ChartType | null;
  availableCharts: ChartType[];
  setChartType: (type: ChartType) => void;
  exportData: (format: 'csv' | 'json' | 'png' | 'svg') => Promise<void>;
  reset: () => void;
  history: AnalyticsResult[];
}

export function useAnalytics(): UseAnalyticsReturn {
  const { supabase, session } = useSupabase();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType | null>(null);
  const [availableCharts, setAvailableCharts] = useState<ChartType[]>([]);
  const [history, setHistory] = useState<AnalyticsResult[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Execute natural language query
   */
  const execute = useCallback(async (naturalLanguageQuery: string) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setQuery(naturalLanguageQuery);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get user preferences
      const { data: preferences } = await supabase.rpc('get_user_preferences');

      // Call edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/wrenai-chat-agent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            query: naturalLanguageQuery,
            context: getContext(),
            preferences
          }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Query processing failed');
      }

      // Update state with results
      setResult(data);
      setChartType(data.chartType);
      setAvailableCharts(data.availableCharts || getCompatibleCharts(data));
      
      // Add to history
      setHistory(prev => [data, ...prev].slice(0, 50)); // Keep last 50

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        console.error('Analytics error:', err);
        setError(err.message || 'An error occurred while processing your query');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [supabase, session]);

  /**
   * Get query context for follow-ups
   */
  const getContext = useCallback(() => {
    if (!result) return {};

    return {
      previousQuery: query,
      previousResults: result.data.slice(0, 10), // Sample of results
      entities: result.entities,
      sessionId: session?.user?.id
    };
  }, [result, query, session]);

  /**
   * Determine compatible chart types
   */
  const getCompatibleCharts = (analyticsResult: AnalyticsResult): ChartType[] => {
    const charts: ChartType[] = [ChartType.TABLE]; // Always available

    const hasTime = analyticsResult.columns.some(c => c.type === 'date');
    const hasNumeric = analyticsResult.columns.some(c => c.type === 'number');
    const hasCategory = analyticsResult.columns.some(c => c.type === 'string');
    const rowCount = analyticsResult.data.length;

    if (hasTime && hasNumeric) {
      charts.push(ChartType.LINE, ChartType.AREA);
    }

    if (hasCategory && hasNumeric) {
      charts.push(ChartType.BAR);
      if (rowCount <= 8) {
        charts.push(ChartType.PIE);
      }
    }

    if (analyticsResult.columns.filter(c => c.type === 'number').length >= 2) {
      charts.push(ChartType.SCATTER);
    }

    if (rowCount === 1 && hasNumeric) {
      charts.push(ChartType.KPI_CARD, ChartType.GAUGE);
    }

    return charts;
  };

  /**
   * Export data in various formats
   */
  const exportData = useCallback(async (format: 'csv' | 'json' | 'png' | 'svg') => {
    if (!result) return;

    switch (format) {
      case 'csv':
        exportAsCSV(result.data, `analytics-${Date.now()}.csv`);
        break;
      
      case 'json':
        exportAsJSON(result, `analytics-${Date.now()}.json`);
        break;
      
      case 'png':
      case 'svg':
        // This would be handled by the ChartCanvas component
        console.log(`Export as ${format} requested`);
        break;
    }
  }, [result]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setQuery('');
    setResult(null);
    setError(null);
    setChartType(null);
    setAvailableCharts([]);
  }, []);

  return {
    query,
    execute,
    isLoading,
    result,
    error,
    chartConfig: result?.chartConfig || null,
    chartType,
    availableCharts,
    setChartType,
    exportData,
    reset,
    history
  };
}

// Export utilities
function exportAsCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csv, filename, 'text/csv');
}

function exportAsJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
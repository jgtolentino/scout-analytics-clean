/**
 * Main Dashboard Page - WrenAI Clone
 */

import React, { useState } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { ChartCanvas } from '../components/ChartCanvas';
import { ResultTable } from '../components/ResultTable';
import { QueryHistory } from '../components/QueryHistory';
import { useAnalytics } from '../hooks/useAnalytics';
import { ChartType as AnalyticsChartType } from '../components/Charts';

// Local type for ChartCanvas compatibility  
type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'table' | 'kpi' | 'area' | 'heatmap' | 'radar' | 'funnel' | 'gauge' | 'map';

// Convert analytics chart type to canvas chart type
const convertChartType = (analyticsType: AnalyticsChartType): ChartType => {
  switch (analyticsType) {
    case AnalyticsChartType.LINE: return 'line';
    case AnalyticsChartType.BAR: return 'bar';
    case AnalyticsChartType.PIE: return 'pie';
    case AnalyticsChartType.SCATTER: return 'scatter';
    case AnalyticsChartType.TABLE: return 'table';
    case AnalyticsChartType.KPI_CARD: return 'kpi';
    case AnalyticsChartType.AREA: return 'area';
    case AnalyticsChartType.HEATMAP: return 'heatmap';
    case AnalyticsChartType.RADAR: return 'radar';
    case AnalyticsChartType.FUNNEL: return 'funnel';
    case AnalyticsChartType.GAUGE: return 'gauge';
    default: return 'bar';
  }
};
import { 
  Brain, 
  Database, 
  Zap, 
  Info,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share2
} from 'lucide-react';

export default function Dashboard() {
  const {
    query,
    execute,
    isLoading,
    result,
    error,
    chartConfig,
    chartType,
    availableCharts,
    setChartType,
    exportData,
    reset
  } = useAnalytics();

  const [showSQL, setShowSQL] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleQuery = async (naturalLanguageQuery: string) => {
    setFeedback(null); // Reset feedback
    await execute(naturalLanguageQuery);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    // In a real app, this would send feedback to the backend
    console.log(`User feedback: ${type} for query: ${query}`);
  };

  const copySQL = () => {
    if (result?.sql) {
      navigator.clipboard.writeText(result.sql);
      // Show toast notification
    }
  };

  const shareResults = () => {
    // In a real app, this would generate a shareable link
    console.log('Sharing results...');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Pulser AI BI
              </h1>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                WrenAI Enhanced
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Database className="w-4 h-4" />
                <span>Connected to Supabase</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Zap className="w-4 h-4 text-green-500" />
                <span>Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chat Interface */}
        <div className="mb-8">
          <ChatInterface
            onQuery={handleQuery}
            isLoading={isLoading}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Unable to process query
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && !error && (
          <div className="space-y-6">
            {/* Query Info Bar */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {result.explanation}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-blue-600 dark:text-blue-400">
                    <span>Confidence: {Math.round((result.confidence || 0) * 100)}%</span>
                    <span>•</span>
                    <span>{result.data?.length || 0} results</span>
                    <span>•</span>
                    <span>{result.executionTime || 0}ms</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleFeedback('up')}
                    className={`p-2 rounded-lg transition-colors ${
                      feedback === 'up'
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                    }`}
                    title="Good result"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback('down')}
                    className={`p-2 rounded-lg transition-colors ${
                      feedback === 'down'
                        ? 'bg-red-100 text-red-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                    }`}
                    title="Poor result"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowSQL(!showSQL)}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {showSQL ? 'Hide' : 'Show'} SQL
                  </button>
                  <button
                    onClick={shareResults}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Share results"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SQL Display */}
              {showSQL && result.sql && (
                <div className="mt-4 relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{result.sql}</code>
                  </pre>
                  <button
                    onClick={copySQL}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy SQL"
                  >
                    <Copy className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              )}
            </div>

            {/* Visualization */}
            {chartConfig && chartType !== AnalyticsChartType.TABLE && (
              <ChartCanvas
                config={chartConfig}
                type={chartType ? convertChartType(chartType) : 'bar'}
                title={result.intent?.type ? `${result.intent.type} Analysis` : 'Results'}
                onRefresh={() => execute(query)}
                onExport={(format) => exportData(format)}
                onTypeChange={(type: ChartType) => {
                  // Convert back to analytics type when setting
                  const analyticsType = Object.entries({
                    [AnalyticsChartType.LINE]: 'line',
                    [AnalyticsChartType.BAR]: 'bar',
                    [AnalyticsChartType.PIE]: 'pie',
                    [AnalyticsChartType.SCATTER]: 'scatter',
                    [AnalyticsChartType.TABLE]: 'table',
                    [AnalyticsChartType.KPI_CARD]: 'kpi',
                    [AnalyticsChartType.AREA]: 'area',
                  }).find(([_, value]) => value === type)?.[0] as AnalyticsChartType;
                  if (analyticsType) setChartType(analyticsType);
                }}
                availableTypes={availableCharts.map(convertChartType)}
              />
            )}

            {/* Data Table */}
            {result.data && (chartType === AnalyticsChartType.TABLE || result.data.length > 0) && (
              <ResultTable
                data={result.data}
                columns={result.columns}
                title="Detailed Results"
                onExport={(format) => exportData(format as 'csv' | 'json' | 'png' | 'svg')}
              />
            )}

            {/* Follow-up Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  You might also want to know:
                </h3>
                <div className="space-y-2">
                  {result.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuery(suggestion)}
                      className="block w-full text-left px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
                    >
                      → {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !error && !isLoading && (
          <div className="text-center py-16">
            <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              Ask anything about your data
            </h2>
            <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
              Use natural language to explore your data. Try asking about trends, 
              comparisons, or specific metrics.
            </p>
          </div>
        )}
      </main>

      {/* Query History Sidebar */}
      <QueryHistory onSelectQuery={handleQuery} />
    </div>
  );
}
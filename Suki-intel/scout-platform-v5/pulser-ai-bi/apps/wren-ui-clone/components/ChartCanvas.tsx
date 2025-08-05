/**
 * Chart Canvas Component - Renders visualizations with ECharts
 */

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { 
  Download, 
  Maximize2, 
  RefreshCw, 
  MoreVertical,
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Table2,
  TrendingUp
} from 'lucide-react';
// Types for ChartCanvas - define locally since packages not available
interface ChartConfig {
  data: any[];
  theme?: string;
  options: any;
}

type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'table' | 'kpi' | 'area' | 'heatmap' | 'radar' | 'funnel' | 'gauge' | 'map';

interface ChartCanvasProps {
  config: ChartConfig;
  type: ChartType;
  title?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  onTypeChange?: (type: ChartType) => void;
  availableTypes?: ChartType[];
  className?: string;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  config,
  type,
  title,
  isLoading = false,
  onRefresh,
  onExport,
  onTypeChange,
  availableTypes = [],
  className = ''
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Initialize and update chart
  useEffect(() => {
    if (!chartRef.current || isLoading) return;

    // Initialize chart instance
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, config.theme || 'light');
    }

    // Generate ECharts option based on type
    const option = generateEChartsOption(type, config);
    chartInstance.current.setOption(option);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [config, type, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    if (format === 'png' || format === 'svg') {
      const url = chartInstance.current?.getDataURL({
        type: format,
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      
      if (url) {
        const link = document.createElement('a');
        link.download = `chart-${Date.now()}.${format}`;
        link.href = url;
        link.click();
      }
    }
    
    onExport?.(format);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      chartRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getChartIcon = (chartType: ChartType) => {
    const icons: Record<ChartType, React.ReactNode> = {
      line: <LineChart className="w-4 h-4" />,
      bar: <BarChart3 className="w-4 h-4" />,
      pie: <PieChart className="w-4 h-4" />,
      scatter: <ScatterChart className="w-4 h-4" />,
      table: <Table2 className="w-4 h-4" />,
      kpi: <TrendingUp className="w-4 h-4" />,
      area: <LineChart className="w-4 h-4" />,
      heatmap: <BarChart3 className="w-4 h-4" />,
      radar: <ScatterChart className="w-4 h-4" />,
      funnel: <BarChart3 className="w-4 h-4 rotate-90" />,
      gauge: <TrendingUp className="w-4 h-4" />,
      map: <BarChart3 className="w-4 h-4" />
    };
    return icons[chartType] || <BarChart3 className="w-4 h-4" />;
  };

  // Special handling for table type
  if (type === 'table') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
        {renderHeader()}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {config.data[0] && Object.keys(config.data[0]).map(key => (
                  <th 
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {config.data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {Object.values(row).map((value: any, colIdx) => (
                    <td 
                      key={colIdx}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    >
                      {formatValue(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Special handling for KPI type
  if (type === 'kpi') {
    const kpiData = config.data[0] || {};
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        {renderHeader()}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {formatValue(kpiData.value || kpiData.current_value || 0)}
          </div>
          {kpiData.change_percentage && (
            <div className={`mt-2 flex items-center justify-center gap-2 text-sm ${
              kpiData.change_percentage > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 ${kpiData.change_percentage < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(kpiData.change_percentage).toFixed(1)}%</span>
            </div>
          )}
          {kpiData.label && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {kpiData.label}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderHeader() {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title || 'Visualization'}
        </h3>
        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          {availableTypes.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowTypeSelector(!showTypeSelector)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Change chart type"
              >
                {getChartIcon(type)}
              </button>
              
              {showTypeSelector && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  {availableTypes.map(chartType => (
                    <button
                      key={chartType}
                      onClick={() => {
                        onTypeChange?.(chartType);
                        setShowTypeSelector(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2 text-sm
                        hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                        ${type === chartType ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-700 dark:text-gray-300'}
                      `}
                    >
                      {getChartIcon(chartType)}
                      <span className="capitalize">{chartType}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Export Menu */}
          <div className="relative group">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Export options"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => handleExport('png')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Export as PNG
              </button>
              <button
                onClick={() => handleExport('svg')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Export as SVG
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {renderHeader()}
      
      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading visualization...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={chartRef} 
          className="w-full h-[400px]"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
};

// Helper function to generate ECharts options
function generateEChartsOption(type: ChartType, config: ChartConfig): any {
  const baseOption = {
    tooltip: {
      trigger: type === 'pie' ? 'item' : 'axis',
      ...config.options.tooltip
    },
    legend: {
      show: config.options.legend?.show !== false,
      ...config.options.legend
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    ...config.options
  };

  switch (type) {
    case 'line':
    case 'area':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: config.data.map(d => d.x || d.time_period || d.category),
          ...config.options.xAxis
        },
        yAxis: {
          type: 'value',
          ...config.options.yAxis
        },
        series: [{
          type: 'line',
          data: config.data.map(d => d.y || d.value),
          areaStyle: type === 'area' ? {} : undefined,
          smooth: true,
          ...config.options.series?.[0]
        }]
      };

    case 'bar':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: config.data.map(d => d.x || d.category || d.label),
          ...config.options.xAxis
        },
        yAxis: {
          type: 'value',
          ...config.options.yAxis
        },
        series: [{
          type: 'bar',
          data: config.data.map(d => d.y || d.value),
          ...config.options.series?.[0]
        }]
      };

    case 'pie':
      return {
        ...baseOption,
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: config.data.map(d => ({
            name: d.label || d.category || d.x,
            value: d.value || d.y
          })),
          ...config.options.series?.[0]
        }]
      };

    case 'scatter':
      return {
        ...baseOption,
        xAxis: {
          type: 'value',
          ...config.options.xAxis
        },
        yAxis: {
          type: 'value',
          ...config.options.yAxis
        },
        series: [{
          type: 'scatter',
          data: config.data.map(d => [d.x, d.y]),
          ...config.options.series?.[0]
        }]
      };

    default:
      return baseOption;
  }
}

// Helper function to format values
function formatValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  }
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}
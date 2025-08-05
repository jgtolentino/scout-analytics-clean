/**
 * KPI Card Component - Display key performance indicators
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Info
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  format?: 'number' | 'currency' | 'percentage';
  target?: number;
  sparklineData?: number[];
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  info?: string;
  compactMode?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  format = 'number',
  target,
  sparklineData,
  trend,
  subtitle,
  info,
  compactMode = false
}) => {
  // Format the value based on type
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      
      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(val);
    }
  };

  // Calculate trend if not provided
  const calculatedTrend = trend || (change !== undefined ? (
    change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  ) : 'neutral');

  // Get trend icon and color
  const getTrendDisplay = () => {
    switch (calculatedTrend) {
      case 'up':
        return {
          icon: <TrendingUp className="w-4 h-4" />,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'down':
        return {
          icon: <TrendingDown className="w-4 h-4" />,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
      default:
        return {
          icon: <Minus className="w-4 h-4" />,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20'
        };
    }
  };

  const trendDisplay = getTrendDisplay();

  // Calculate progress to target
  const progress = target && typeof value === 'number' ? (value / target) * 100 : null;

  // Generate sparkline path
  const generateSparklinePath = () => {
    if (!sparklineData || sparklineData.length < 2) return '';
    
    const width = 100;
    const height = 30;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    
    const points = sparklineData.map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  if (compactMode) {
    return (
      <div className="kpi-card-compact p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-xs text-gray-500 dark:text-gray-400">{title}</h4>
            <p className="text-lg font-semibold mt-1">{formatValue(value)}</p>
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 ${trendDisplay.color}`}>
              {trendDisplay.icon}
              <span className="text-sm font-medium">
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="kpi-card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {info && (
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
            <div className="absolute right-0 top-6 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {info}
            </div>
          </div>
        )}
      </div>

      {/* Value and Change */}
      <div className="flex items-end justify-between mb-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {formatValue(value)}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendDisplay.bgColor} ${trendDisplay.color}`}>
            {trendDisplay.icon}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>

      {/* Target Progress */}
      {target && progress !== null && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress to target</span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {formatValue(target)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                progress >= 100 
                  ? 'bg-green-600 dark:bg-green-500' 
                  : progress >= 75 
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : progress >= 50
                  ? 'bg-yellow-600 dark:bg-yellow-500'
                  : 'bg-red-600 dark:bg-red-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {progress.toFixed(1)}% of target
          </div>
        </div>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
          <svg 
            className="w-full h-8" 
            viewBox="0 0 100 30" 
            preserveAspectRatio="none"
          >
            <path
              d={generateSparklinePath()}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-600 dark:text-blue-400"
            />
          </svg>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Last {sparklineData.length} periods</span>
            <span>{calculatedTrend === 'up' ? 'Increasing' : calculatedTrend === 'down' ? 'Decreasing' : 'Stable'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
/**
 * Heatmap Chart Component - For temporal and density visualizations
 * Used in: Transaction patterns, geographic heat zones, correlation matrices
 */

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useScoutRuntime } from '../../hooks/useScoutRuntime';
import { ScoutEventType } from '../../lib/scoutEventBus';
import { ChartProvider } from '../../contexts/ChartContext';
import { ExplainThisChartButton } from './ExplainThisChartButton';
import { useStoryModeVisibility } from '../../contexts/StoryModeContext';

interface HeatmapChartProps {
  id?: string;
  data: Array<[number, number, number]>; // [x, y, value]
  xAxis: string[];
  yAxis: string[];
  title?: string;
  colorScheme?: 'warm' | 'cool' | 'diverging';
  showValues?: boolean;
  min?: number;
  max?: number;
  onCellClick?: (cell: { x: number; y: number; value: number }) => void;
  height?: number;
  showExplainButton?: boolean;
  audience?: 'executive' | 'manager' | 'analyst';
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  id = `heatmap-${Date.now()}`,
  data,
  xAxis,
  yAxis,
  title,
  colorScheme = 'warm',
  showValues = true,
  min,
  max,
  onCellClick,
  height = 400,
  showExplainButton = true,
  audience = 'manager'
}) => {
  const { emitEvent, requestAIInsight } = useScoutRuntime({ source: 'heatmap-chart' });
  const explainButtonVisibility = useStoryModeVisibility({
    showInFocus: true,
    showInExplore: true,
    emphasizeInFocus: true
  });

  // Color schemes
  const colorSchemes = {
    warm: ['#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#DC2626'],
    cool: ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#1E40AF'],
    diverging: ['#1E40AF', '#3B82F6', '#93C5FD', '#FEE2E2', '#FCA5A5', '#EF4444', '#991B1B']
  };

  // Calculate min/max if not provided
  const [dataMin, dataMax] = useMemo(() => {
    if (min !== undefined && max !== undefined) {
      return [min, max];
    }
    const values = data.map(d => d[2]);
    return [Math.min(...values), Math.max(...values)];
  }, [data, min, max]);

  // Find hotspots and patterns
  const findHotspots = () => {
    const threshold = dataMin + (dataMax - dataMin) * 0.8;
    return data
      .filter(d => d[2] >= threshold)
      .map(d => ({
        x: xAxis[d[0]],
        y: yAxis[d[1]],
        value: d[2]
      }));
  };

  // ECharts configuration
  const option = useMemo(() => ({
    title: title ? {
      text: title,
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    } : undefined,
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const xLabel = xAxis[params.value[0]];
        const yLabel = yAxis[params.value[1]];
        const value = params.value[2];
        return `
          <div style="padding: 8px;">
            <strong>${xLabel} × ${yLabel}</strong><br/>
            Value: ${value.toLocaleString()}
          </div>
        `;
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: title ? '15%' : '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxis,
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate: xAxis.length > 10 ? 45 : 0,
        interval: xAxis.length > 20 ? 'auto' : 0
      }
    },
    yAxis: {
      type: 'category',
      data: yAxis,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: dataMin,
      max: dataMax,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      color: colorSchemes[colorScheme]
    },
    series: [{
      name: 'Heatmap',
      type: 'heatmap',
      data: data,
      label: {
        show: showValues,
        fontSize: data.length > 100 ? 10 : 12,
        formatter: (params: any) => {
          return params.value[2].toLocaleString();
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: '#fff'
      }
    }],
    animationType: 'scale',
    animationEasing: 'elasticOut',
    animationDuration: 1000
  }), [data, xAxis, yAxis, title, colorScheme, showValues, dataMin, dataMax]);

  // Event handlers
  const onChartClick = (params: any) => {
    if (params.componentType === 'series') {
      const [xIndex, yIndex, value] = params.value;
      const cellData = {
        x: xIndex,
        y: yIndex,
        value: value,
        xLabel: xAxis[xIndex],
        yLabel: yAxis[yIndex]
      };

      emitEvent(ScoutEventType.MARK_SELECTED, {
        chartType: 'heatmap',
        cell: cellData
      });

      if (onCellClick) {
        onCellClick(cellData);
      }
    }
  };

  // Pattern detection for metadata
  const detectPatterns = () => {
    const patterns = [];
    
    // Check for day-of-week patterns
    if (yAxis.includes('Monday') || yAxis.includes('Mon')) {
      const weekdayAvg = data
        .filter(d => d[1] < 5) // Weekdays
        .reduce((sum, d) => sum + d[2], 0) / data.filter(d => d[1] < 5).length;
      
      const weekendAvg = data
        .filter(d => d[1] >= 5) // Weekends
        .reduce((sum, d) => sum + d[2], 0) / data.filter(d => d[1] >= 5).length;
      
      if (weekdayAvg > weekendAvg * 1.2) {
        patterns.push('Weekday activity is 20% higher than weekends');
      }
    }
    
    return patterns;
  };

  // Prepare chart context for AI explanations
  const chartContext = {
    chartId: id,
    chartType: 'heatmap',
    data: data.map(([x, y, value]) => ({
      x: xAxis[x],
      y: yAxis[y],
      value
    })),
    title,
    filters: {},
    metadata: {
      xAxisType: xAxis[0],
      yAxisType: yAxis[0],
      valueRange: { min: dataMin, max: dataMax },
      hotspots: findHotspots().slice(0, 5),
      patterns: detectPatterns(),
      pattern: 'temporal_density'
    }
  };

  return (
    <ChartProvider value={chartContext}>
      <div className="heatmap-chart-container relative">
        <ReactECharts
          option={option}
          style={{ height: `${height}px`, width: '100%' }}
          onEvents={{
            click: onChartClick
          }}
        />
        
        {/* AI Explain Button */}
        {showExplainButton && (
          <div className={explainButtonVisibility.className}>
            <ExplainThisChartButton
              position="top-right"
              variant="icon"
              audience={audience}
            />
          </div>
        )}
      </div>
    </ChartProvider>
  );
};
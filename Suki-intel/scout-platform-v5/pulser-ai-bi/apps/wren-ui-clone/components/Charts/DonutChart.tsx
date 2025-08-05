/**
 * Donut Chart Component - For part-to-whole visualizations
 * Used in: Regional performance, market share, category breakdowns
 */

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useScoutRuntime } from '../../hooks/useScoutRuntime';
import { ScoutEventType } from '../../lib/scoutEventBus';
import { ChartProvider } from '../../contexts/ChartContext';
import { ExplainThisChartButton } from './ExplainThisChartButton';
import { useStoryModeVisibility } from '../../contexts/StoryModeContext';

interface DonutChartProps {
  id?: string;
  data: Array<{
    name: string;
    value: number;
    percentage?: number;
  }>;
  title?: string;
  centerLabel?: string;
  colorPalette?: string[];
  showLegend?: boolean;
  enableDrillDown?: boolean;
  onDrillDown?: (item: any) => void;
  height?: number;
  showExplainButton?: boolean;
  audience?: 'executive' | 'manager' | 'analyst';
}

export const DonutChart: React.FC<DonutChartProps> = ({
  id = `donut-${Date.now()}`,
  data,
  title,
  centerLabel,
  colorPalette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  showLegend = true,
  enableDrillDown = true,
  onDrillDown,
  height = 400,
  showExplainButton = true,
  audience = 'manager'
}) => {
  const { emitEvent, requestAIInsight } = useScoutRuntime({ source: 'donut-chart' });
  const explainButtonVisibility = useStoryModeVisibility({
    showInFocus: true,
    showInExplore: true,
    emphasizeInFocus: true
  });

  // Calculate total and percentages
  const processedData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1)
    }));
  }, [data]);

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
      trigger: 'item',
      formatter: (params: any) => {
        const item = processedData[params.dataIndex];
        return `
          <div style="padding: 8px;">
            <strong>${params.name}</strong><br/>
            Value: ${params.value.toLocaleString()}<br/>
            Share: ${item.percentage}%
          </div>
        `;
      }
    },
    legend: showLegend ? {
      orient: 'vertical',
      right: 10,
      top: 'center',
      formatter: (name: string) => {
        const item = processedData.find(d => d.name === name);
        return `${name} (${item?.percentage}%)`;
      }
    } : undefined,
    series: [
      {
        name: title || 'Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            formatter: (params: any) => {
              return `${params.name}\n${params.percent}%`;
            }
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: processedData.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: colorPalette[index % colorPalette.length]
          }
        }))
      }
    ],
    // Center label
    graphic: centerLabel ? [{
      type: 'text',
      left: '40%',
      top: 'center',
      style: {
        text: centerLabel,
        textAlign: 'center',
        fill: '#333',
        fontSize: 24,
        fontWeight: 'bold'
      }
    }] : undefined,
    // Animation
    animationType: 'scale',
    animationEasing: 'elasticOut',
    animationDelay: (idx: number) => idx * 50
  }), [processedData, title, centerLabel, colorPalette, showLegend]);

  // Event handlers
  const onChartClick = (params: any) => {
    if (enableDrillDown) {
      emitEvent(ScoutEventType.MARK_SELECTED, {
        chartType: 'donut',
        item: params.data,
        name: params.name,
        value: params.value
      });

      if (onDrillDown) {
        onDrillDown(params.data);
      }
    }
  };

  const onChartHover = (params: any) => {
    if (params.type === 'mouseover') {
      emitEvent('chart:hover', {
        chartType: 'donut',
        item: params.data
      });
    }
  };

  // Prepare chart context for AI explanations
  const chartContext = {
    chartId: id,
    chartType: 'donut',
    data: processedData,
    title,
    filters: {},
    metadata: {
      topCategory: processedData[0]?.name,
      distribution: processedData.map(d => `${d.name}: ${d.percentage}%`).join(', '),
      total: processedData.reduce((sum, item) => sum + item.value, 0)
    }
  };

  return (
    <ChartProvider value={chartContext}>
      <div className="donut-chart-container relative">
        <ReactECharts
          option={option}
          style={{ height: `${height}px`, width: '100%' }}
          onEvents={{
            click: onChartClick,
            mouseover: onChartHover
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
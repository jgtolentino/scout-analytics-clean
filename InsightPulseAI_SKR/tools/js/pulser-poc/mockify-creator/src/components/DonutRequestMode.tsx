import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DataBadgeWrapper } from './DataBadge';

interface RequestModeData {
  request_mode: string;
  transaction_count: number;
  percentage: number;
  data_quality_score: number;
  data_coverage_pct: number;
}

interface DonutRequestModeProps {
  data: RequestModeData[];
  showLegend?: boolean;
  className?: string;
}

const REQUEST_MODE_COLORS = {
  verbal: '#10B981',    // Green - direct verbal communication
  point: '#3B82F6',     // Blue - pointing gesture
  indirect: '#F59E0B',  // Amber - indirect/descriptive
  unknown: '#9CA3AF'    // Gray - unknown
};

const REQUEST_MODE_LABELS = {
  verbal: 'Verbal Request',
  point: 'Pointing',
  indirect: 'Indirect/Description',
  unknown: 'Unknown'
};

export const DonutRequestMode: React.FC<DonutRequestModeProps> = ({ 
  data, 
  showLegend = true,
  className = '' 
}) => {
  // Filter out unknown for cleaner visualization
  const chartData = React.useMemo(() => {
    return data
      .filter(item => item.request_mode !== 'unknown')
      .map(item => ({
        name: REQUEST_MODE_LABELS[item.request_mode as keyof typeof REQUEST_MODE_LABELS] || item.request_mode,
        value: item.transaction_count,
        percentage: item.percentage,
        color: REQUEST_MODE_COLORS[item.request_mode as keyof typeof REQUEST_MODE_COLORS] || REQUEST_MODE_COLORS.unknown
      }));
  }, [data]);
  
  // Calculate average data quality
  const avgQuality = data.length > 0 
    ? data.reduce((sum, item) => sum + item.data_quality_score, 0) / data.length 
    : 1;
  const avgCoverage = data.length > 0
    ? data.reduce((sum, item) => sum + item.data_coverage_pct, 0) / data.length
    : 1;
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0];
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-md border border-gray-200">
          <div className="font-semibold text-sm">{data.name}</div>
          <div className="text-xs text-gray-600">
            Count: {data.value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            Percentage: {data.payload.percentage}%
          </div>
        </div>
      );
    }
    return null;
  };
  
  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };
  
  return (
    <DataBadgeWrapper
      title="Purchase Request Methods"
      quality={avgQuality}
      coverage={avgCoverage}
      className={className}
    >
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center justify-between">
            <span>💡 Tip: Verbal requests often indicate brand loyalty</span>
            <a 
              href="#" 
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => {
                e.preventDefault();
                alert('Request Mode Analysis:\n\n• Verbal: Customer asks for specific brand by name\n• Pointing: Customer points to desired product\n• Indirect: Customer describes product characteristics');
              }}
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </DataBadgeWrapper>
  );
};
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  id: string;
  label?: string;
  config?: {
    data_source?: string;
    metrics?: string[];
    dimensions?: string[];
    limit?: number;
    sort?: object;
  };
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    action?: string;
  }>;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  id,
  label,
  config,
  actions,
  className
}) => {
  // TODO: Fetch data based on config.data_source
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch data from Supabase
    fetchData();
  }, [config]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual data fetching
      // const response = await supabase
      //   .from(config?.data_source || '')
      //   .select('*');
      setData([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {label && (
          <h3 className="text-lg font-semibold mb-4">{label}</h3>
        )}
        
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3563E9" />
          </BarChart>
        </ResponsiveContainer>
        
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={() => console.log('Action:', action.action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BarChart;

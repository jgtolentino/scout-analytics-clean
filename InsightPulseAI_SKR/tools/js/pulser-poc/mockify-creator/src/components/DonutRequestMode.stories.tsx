import type { Meta, StoryObj } from '@storybook/react';
import { DonutRequestMode } from './DonutRequestMode';

const meta = {
  title: 'Charts/DonutRequestMode',
  component: DonutRequestMode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DonutRequestMode>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseData = [
  {
    request_mode: 'verbal',
    transaction_count: 4567,
    percentage: 45.7,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    request_mode: 'point',
    transaction_count: 3211,
    percentage: 32.1,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    request_mode: 'indirect',
    transaction_count: 1876,
    percentage: 18.8,
    data_quality_score: 0.9,
    data_coverage_pct: 1.0
  },
  {
    request_mode: 'unknown',
    transaction_count: 346,
    percentage: 3.4,
    data_quality_score: 0.5,
    data_coverage_pct: 1.0
  }
];

export const Default: Story = {
  args: {
    data: baseData,
  },
};

export const WithoutLegend: Story = {
  args: {
    data: baseData,
    showLegend: false,
  },
};

export const HighQualityData: Story = {
  args: {
    data: baseData.map(item => ({
      ...item,
      data_quality_score: 1.0
    })),
  },
};

export const LowQualityData: Story = {
  args: {
    data: baseData.map(item => ({
      ...item,
      data_quality_score: item.request_mode === 'unknown' ? 0.3 : 0.7,
      data_coverage_pct: 0.8
    })),
  },
};

export const VerbalDominant: Story = {
  args: {
    data: [
      {
        request_mode: 'verbal',
        transaction_count: 7500,
        percentage: 75,
        data_quality_score: 1.0,
        data_coverage_pct: 1.0
      },
      {
        request_mode: 'point',
        transaction_count: 1500,
        percentage: 15,
        data_quality_score: 1.0,
        data_coverage_pct: 1.0
      },
      {
        request_mode: 'indirect',
        transaction_count: 800,
        percentage: 8,
        data_quality_score: 0.9,
        data_coverage_pct: 1.0
      },
      {
        request_mode: 'unknown',
        transaction_count: 200,
        percentage: 2,
        data_quality_score: 0.5,
        data_coverage_pct: 1.0
      }
    ],
  },
};

export const EvenDistribution: Story = {
  args: {
    data: [
      {
        request_mode: 'verbal',
        transaction_count: 3333,
        percentage: 33.3,
        data_quality_score: 1.0,
        data_coverage_pct: 1.0
      },
      {
        request_mode: 'point',
        transaction_count: 3334,
        percentage: 33.4,
        data_quality_score: 1.0,
        data_coverage_pct: 1.0
      },
      {
        request_mode: 'indirect',
        transaction_count: 3333,
        percentage: 33.3,
        data_quality_score: 1.0,
        data_coverage_pct: 1.0
      }
    ],
  },
};

export const InDashboard: Story = {
  render: () => (
    <div className="bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Monitoring Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DonutRequestMode data={baseData} />
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
              <span className="text-sm text-gray-500">Toggle to Request Mode →</span>
            </div>
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
              Sentiment Chart Placeholder
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 45.7% of customers use verbal requests, indicating strong brand awareness</li>
            <li>• Pointing gestures account for 32.1% - opportunity for better signage</li>
            <li>• 18.8% use indirect descriptions - potential for staff training</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};
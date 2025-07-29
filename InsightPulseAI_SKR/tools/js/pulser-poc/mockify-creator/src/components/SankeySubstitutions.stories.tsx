import type { Meta, StoryObj } from '@storybook/react';
import { SankeySubstitutions } from './SankeySubstitutions';

const meta = {
  title: 'Charts/SankeySubstitutions',
  component: SankeySubstitutions,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SankeySubstitutions>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseData = [
  {
    source_brand: 'Coca-Cola',
    target_brand: 'Pepsi',
    total_value: 125000,
    substitution_count: 342,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    source_brand: 'Coca-Cola',
    target_brand: 'RC Cola',
    total_value: 45000,
    substitution_count: 128,
    data_quality_score: 0.8,
    data_coverage_pct: 1.0
  },
  {
    source_brand: 'Sprite',
    target_brand: '7UP',
    total_value: 78000,
    substitution_count: 215,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    source_brand: 'Mountain Dew',
    target_brand: 'Sprite',
    total_value: 32000,
    substitution_count: 89,
    data_quality_score: 0.8,
    data_coverage_pct: 1.0
  },
  {
    source_brand: 'Fanta',
    target_brand: 'Orange Crush',
    total_value: 28000,
    substitution_count: 76,
    data_quality_score: 0.8,
    data_coverage_pct: 1.0
  },
  {
    source_brand: 'Pepsi',
    target_brand: 'Coca-Cola',
    total_value: 98000,
    substitution_count: 267,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  }
];

export const Default: Story = {
  args: {
    data: baseData,
  },
};

export const LargeDataset: Story = {
  args: {
    data: [
      ...baseData,
      {
        source_brand: '7UP',
        target_brand: 'Sprite',
        total_value: 65000,
        substitution_count: 178,
        data_quality_score: 0.9,
        data_coverage_pct: 1.0
      },
      {
        source_brand: 'Dr Pepper',
        target_brand: 'Coca-Cola',
        total_value: 22000,
        substitution_count: 58,
        data_quality_score: 0.6,
        data_coverage_pct: 1.0
      },
      {
        source_brand: 'Gatorade',
        target_brand: 'Powerade',
        total_value: 41000,
        substitution_count: 112,
        data_quality_score: 0.8,
        data_coverage_pct: 1.0
      }
    ],
  },
};

export const CustomHeight: Story = {
  args: {
    data: baseData,
    height: 400,
  },
};

export const LowQualityData: Story = {
  args: {
    data: baseData.map(item => ({
      ...item,
      data_quality_score: 0.6,
      data_coverage_pct: 0.7
    })),
  },
};

export const MinimalData: Story = {
  args: {
    data: [
      {
        source_brand: 'Brand A',
        target_brand: 'Brand B',
        total_value: 50000,
        substitution_count: 100,
        data_quality_score: 0.9,
        data_coverage_pct: 1.0
      },
      {
        source_brand: 'Brand B',
        target_brand: 'Brand C',
        total_value: 30000,
        substitution_count: 75,
        data_quality_score: 0.85,
        data_coverage_pct: 1.0
      }
    ],
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
  },
};

export const InDashboard: Story = {
  render: () => (
    <div className="bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Store Analytics Dashboard</h2>
        
        <div className="grid grid-cols-1 gap-6">
          <SankeySubstitutions data={baseData} />
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-2">Other Analytics Component</h3>
            <div className="h-48 bg-gray-50 rounded flex items-center justify-center text-gray-400">
              Another Chart
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
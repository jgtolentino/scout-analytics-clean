import type { Meta, StoryObj } from '@storybook/react';
import { DataBadge, DataBadgeWrapper } from '../components/DataBadge';

const meta = {
  title: 'Components/DataBadge',
  component: DataBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighQuality: Story = {
  args: {
    quality: 0.95,
    coverage: 0.98,
  },
};

export const MediumQuality: Story = {
  args: {
    quality: 0.8,
    coverage: 0.75,
  },
};

export const LowQuality: Story = {
  args: {
    quality: 0.6,
    coverage: 0.45,
  },
};

export const PerfectScore: Story = {
  args: {
    quality: 1,
    coverage: 1,
  },
};

export const WithChartWrapper: Story = {
  render: () => (
    <div className="w-96 p-4 bg-gray-50 rounded-lg">
      <DataBadgeWrapper 
        title="Daily Revenue Trends" 
        quality={0.92} 
        coverage={0.88}
      >
        <div className="h-48 bg-white rounded border border-gray-200 flex items-center justify-center text-gray-400">
          Chart Placeholder
        </div>
      </DataBadgeWrapper>
    </div>
  ),
};

export const MultipleStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-32">High Quality:</span>
        <DataBadge quality={0.95} coverage={0.92} />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32">Medium Quality:</span>
        <DataBadge quality={0.82} coverage={0.78} />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32">Low Quality:</span>
        <DataBadge quality={0.65} coverage={0.55} />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32">Critical:</span>
        <DataBadge quality={0.4} coverage={0.3} />
      </div>
    </div>
  ),
};
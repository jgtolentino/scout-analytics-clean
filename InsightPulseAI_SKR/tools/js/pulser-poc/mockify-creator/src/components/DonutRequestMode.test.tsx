import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DonutRequestMode } from './DonutRequestMode';

// Mock recharts
jest.mock('recharts', () => {
  const MockedPieChart = ({ children }: any) => <div data-testid="pie-chart">{children}</div>;
  const MockedPie = ({ data, label }: any) => (
    <div data-testid="pie">
      {data.map((item: any, index: number) => (
        <div key={index} data-testid={`pie-segment-${index}`}>
          {item.name}: {item.value} ({label && label(item)})
        </div>
      ))}
    </div>
  );
  const MockedCell = ({ fill }: any) => <div style={{ color: fill }}>Cell</div>;
  const MockedLegend = ({ formatter }: any) => (
    <div data-testid="legend">
      {['Verbal Request', 'Pointing', 'Indirect/Description'].map(item => (
        <div key={item}>{formatter ? formatter(item) : item}</div>
      ))}
    </div>
  );
  const MockedTooltip = () => <div data-testid="tooltip" />;
  const MockedResponsiveContainer = ({ children }: any) => <div>{children}</div>;

  return {
    PieChart: MockedPieChart,
    Pie: MockedPie,
    Cell: MockedCell,
    Legend: MockedLegend,
    Tooltip: MockedTooltip,
    ResponsiveContainer: MockedResponsiveContainer
  };
});

const mockData = [
  {
    request_mode: 'verbal',
    transaction_count: 450,
    percentage: 45,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    request_mode: 'point',
    transaction_count: 300,
    percentage: 30,
    data_quality_score: 1.0,
    data_coverage_pct: 1.0
  },
  {
    request_mode: 'indirect',
    transaction_count: 200,
    percentage: 20,
    data_quality_score: 0.8,
    data_coverage_pct: 1.0
  },
  {
    request_mode: 'unknown',
    transaction_count: 50,
    percentage: 5,
    data_quality_score: 0.5,
    data_coverage_pct: 1.0
  }
];

describe('DonutRequestMode', () => {
  it('renders with title and data badge', () => {
    render(<DonutRequestMode data={mockData} />);
    expect(screen.getByText('Purchase Request Methods')).toBeInTheDocument();
    // Average quality: (1.0 + 1.0 + 0.8 + 0.5) / 4 = 0.825 = 83%
    expect(screen.getByText('83%')).toBeInTheDocument();
  });

  it('filters out unknown request modes from visualization', () => {
    render(<DonutRequestMode data={mockData} />);
    
    // Should show verbal, point, and indirect
    expect(screen.getByText(/Verbal Request: 450/)).toBeInTheDocument();
    expect(screen.getByText(/Pointing: 300/)).toBeInTheDocument();
    expect(screen.getByText(/Indirect\/Description: 200/)).toBeInTheDocument();
    
    // Should not show unknown
    expect(screen.queryByText(/Unknown/)).not.toBeInTheDocument();
  });

  it('displays percentages in pie segments', () => {
    render(<DonutRequestMode data={mockData} />);
    
    // Check that percentages are displayed
    expect(screen.getByText(/45%/)).toBeInTheDocument();
    expect(screen.getByText(/30%/)).toBeInTheDocument();
    expect(screen.getByText(/20%/)).toBeInTheDocument();
  });

  it('shows legend by default', () => {
    render(<DonutRequestMode data={mockData} />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('hides legend when showLegend is false', () => {
    render(<DonutRequestMode data={mockData} showLegend={false} />);
    expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
  });

  it('shows tooltip tip at bottom', () => {
    render(<DonutRequestMode data={mockData} />);
    expect(screen.getByText(/Verbal requests often indicate brand loyalty/)).toBeInTheDocument();
  });

  it('handles learn more link click', () => {
    window.alert = jest.fn();
    render(<DonutRequestMode data={mockData} />);
    
    const learnMoreLink = screen.getByText('Learn more');
    fireEvent.click(learnMoreLink);
    
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Request Mode Analysis'));
  });

  it('handles empty data gracefully', () => {
    render(<DonutRequestMode data={[]} />);
    expect(screen.getByText('Purchase Request Methods')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument(); // Default quality
  });

  it('applies custom className', () => {
    const { container } = render(
      <DonutRequestMode data={mockData} className="custom-donut" />
    );
    expect(container.firstChild).toHaveClass('custom-donut');
  });
});
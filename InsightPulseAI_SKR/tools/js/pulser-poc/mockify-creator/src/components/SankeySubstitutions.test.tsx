import React from 'react';
import { render, screen } from '@testing-library/react';
import { SankeySubstitutions } from './SankeySubstitutions';

// Mock @nivo/sankey
jest.mock('@nivo/sankey', () => ({
  ResponsiveSankey: ({ data, tooltip }: any) => {
    // Simulate rendering the sankey with test data
    return (
      <div data-testid="sankey-chart">
        <div>Nodes: {data.nodes.length}</div>
        <div>Links: {data.links.length}</div>
        {data.links.map((link: any, i: number) => (
          <div key={i} data-testid={`link-${i}`}>
            {link.source} → {link.target}: {link.value}
          </div>
        ))}
      </div>
    );
  }
}));

const mockData = [
  {
    source_brand: 'Coca-Cola',
    target_brand: 'Pepsi',
    total_value: 15000,
    substitution_count: 45,
    data_quality_score: 0.9,
    data_coverage_pct: 1
  },
  {
    source_brand: 'Sprite',
    target_brand: '7UP',
    total_value: 8000,
    substitution_count: 23,
    data_quality_score: 0.85,
    data_coverage_pct: 1
  },
  {
    source_brand: 'Mountain Dew',
    target_brand: 'Sprite',
    total_value: 5000,
    substitution_count: 15,
    data_quality_score: 0.8,
    data_coverage_pct: 1
  }
];

describe('SankeySubstitutions', () => {
  it('renders the component with title', () => {
    render(<SankeySubstitutions data={mockData} />);
    expect(screen.getByText('Brand Substitution Flows')).toBeInTheDocument();
  });

  it('displays data quality badge with correct average', () => {
    render(<SankeySubstitutions data={mockData} />);
    // Average quality: (0.9 + 0.85 + 0.8) / 3 = 0.85 = 85%
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('transforms data correctly for sankey visualization', () => {
    render(<SankeySubstitutions data={mockData} />);
    
    // Should have 5 unique nodes (Coca-Cola, Pepsi, Sprite, 7UP, Mountain Dew)
    expect(screen.getByText('Nodes: 5')).toBeInTheDocument();
    
    // Should have 3 links
    expect(screen.getByText('Links: 3')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<SankeySubstitutions data={[]} />);
    expect(screen.getByText('Brand Substitution Flows')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument(); // Default quality
  });

  it('respects custom height prop', () => {
    const { container } = render(<SankeySubstitutions data={mockData} height={400} />);
    const chartContainer = container.querySelector('[style*="height"]');
    expect(chartContainer).toHaveStyle({ height: '400px' });
  });

  it('applies custom className', () => {
    const { container } = render(
      <SankeySubstitutions data={mockData} className="custom-sankey" />
    );
    expect(container.firstChild).toHaveClass('custom-sankey');
  });

  it('preserves link metadata for tooltips', () => {
    render(<SankeySubstitutions data={mockData} />);
    
    // Check that value data is preserved
    expect(screen.getByText(/Coca-Cola → Pepsi: 15000/)).toBeInTheDocument();
    expect(screen.getByText(/Sprite → 7UP: 8000/)).toBeInTheDocument();
  });
});
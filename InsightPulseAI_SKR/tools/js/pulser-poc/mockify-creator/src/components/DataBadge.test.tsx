import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataBadge, DataBadgeWrapper } from './DataBadge';

describe('DataBadge', () => {
  it('renders green badge for high quality score', () => {
    render(<DataBadge quality={0.95} coverage={0.92} />);
    const badge = screen.getByText('94%');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-green-100', 'text-green-800');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders amber badge for medium quality score', () => {
    render(<DataBadge quality={0.8} coverage={0.75} />);
    const badge = screen.getByText('78%');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-amber-100', 'text-amber-800');
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('renders red badge for low quality score', () => {
    render(<DataBadge quality={0.6} coverage={0.5} />);
    const badge = screen.getByText('55%');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-red-100', 'text-red-800');
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('shows detailed tooltip on hover', () => {
    render(<DataBadge quality={0.85} coverage={0.95} />);
    const badge = screen.getByText('90%').parentElement;
    expect(badge).toHaveAttribute('title', 'Data Quality: 85% | Coverage: 95%');
  });

  it('uses default values when props not provided', () => {
    render(<DataBadge />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

describe('DataBadgeWrapper', () => {
  it('renders title with badge', () => {
    render(
      <DataBadgeWrapper title="Revenue Trends" quality={0.9} coverage={0.85}>
        <div>Chart content</div>
      </DataBadgeWrapper>
    );
    
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('Chart content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <DataBadgeWrapper 
        title="Test Chart" 
        className="custom-class"
        quality={1} 
        coverage={1}
      />
    );
    
    const wrapper = screen.getByText('Test Chart').closest('div')?.parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
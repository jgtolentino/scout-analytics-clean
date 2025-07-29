import React from 'react';

interface DataBadgeProps {
  quality?: number;
  coverage?: number;
  className?: string;
}

export const DataBadge: React.FC<DataBadgeProps> = ({ 
  quality = 1, 
  coverage = 1,
  className = '' 
}) => {
  // Calculate overall score (average of quality and coverage)
  const score = (quality + coverage) / 2;
  
  // Determine color based on score
  const getColorClasses = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.75) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };
  
  const getIcon = (score: number) => {
    if (score >= 0.9) return '✓';
    if (score >= 0.75) return '!';
    return '✗';
  };
  
  const colorClasses = getColorClasses(score);
  const icon = getIcon(score);
  
  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${colorClasses} ${className}`}
      title={`Data Quality: ${(quality * 100).toFixed(0)}% | Coverage: ${(coverage * 100).toFixed(0)}%`}
    >
      <span className="mr-1">{icon}</span>
      <span>{(score * 100).toFixed(0)}%</span>
    </span>
  );
};

// Wrapper component for chart/KPI titles
interface DataBadgeWrapperProps {
  title: string;
  quality?: number;
  coverage?: number;
  children?: React.ReactNode;
  className?: string;
}

export const DataBadgeWrapper: React.FC<DataBadgeWrapperProps> = ({
  title,
  quality = 1,
  coverage = 1,
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <DataBadge quality={quality} coverage={coverage} />
      </div>
      {children}
    </div>
  );
};
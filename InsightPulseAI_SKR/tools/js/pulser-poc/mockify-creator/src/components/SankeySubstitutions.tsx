import React from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { DataBadgeWrapper } from './DataBadge';

interface SubstitutionData {
  source_brand: string;
  target_brand: string;
  total_value: number;
  substitution_count: number;
  data_quality_score: number;
  data_coverage_pct: number;
}

interface SankeySubstitutionsProps {
  data: SubstitutionData[];
  height?: number;
  className?: string;
}

export const SankeySubstitutions: React.FC<SankeySubstitutionsProps> = ({ 
  data, 
  height = 280,
  className = '' 
}) => {
  // Transform data for Nivo Sankey format
  const sankeyData = React.useMemo(() => {
    // Handle empty data
    if (!data || data.length === 0) {
      return { nodes: [], links: [] };
    }
    
    // Filter out circular links (brand to itself) and invalid data
    const filteredData = data.filter(item => 
      item.source_brand && 
      item.target_brand && 
      item.source_brand !== item.target_brand &&
      item.total_value > 0
    );
    
    // If no valid data after filtering, return empty
    if (filteredData.length === 0) {
      return { nodes: [], links: [] };
    }
    
    // Get unique brands
    const nodes = new Set<string>();
    filteredData.forEach(item => {
      nodes.add(item.source_brand);
      nodes.add(item.target_brand);
    });
    
    // Create nodes array
    const nodeArray = Array.from(nodes).map(id => ({ id }));
    
    // Create links array
    const links = filteredData.map(item => ({
      source: item.source_brand,
      target: item.target_brand,
      value: item.total_value || 1, // Ensure value is at least 1
      // Store extra data for tooltip
      count: item.substitution_count || 0
    }));
    
    return { nodes: nodeArray, links };
  }, [data]);
  
  // Calculate average data quality
  const avgQuality = data.length > 0 
    ? data.reduce((sum, item) => sum + item.data_quality_score, 0) / data.length 
    : 1;
  const avgCoverage = data.length > 0
    ? data.reduce((sum, item) => sum + item.data_coverage_pct, 0) / data.length
    : 1;
  
  // Brand color mapping (consistent with brand guidelines)
  const getNodeColor = (node: any) => {
    const brandColors: Record<string, string> = {
      'Coca-Cola': '#F40009',
      'Pepsi': '#004B93',
      'Sprite': '#00A859',
      'Mountain Dew': '#53B848',
      'Fanta': '#FF8300',
      '7UP': '#00A859',
      'Dr Pepper': '#8B0000',
      'default': '#6B7280'
    };
    return brandColors[node.id] || brandColors.default;
  };
  
  return (
    <DataBadgeWrapper
      title="Brand Substitution Flows"
      quality={avgQuality}
      coverage={avgCoverage}
      className={className}
    >
      <div style={{ height }} className="bg-white rounded-lg border border-gray-200 p-4">
        {sankeyData.nodes.length > 0 && sankeyData.links.length > 0 ? (
          <ResponsiveSankey
            data={sankeyData}
            margin={{ top: 10, right: 120, bottom: 10, left: 120 }}
            align="justify"
            colors={getNodeColor}
            nodeOpacity={1}
            nodeHoverOpacity={1}
            nodeThickness={18}
            nodeInnerPadding={3}
            nodeBorderWidth={0}
            nodeBorderRadius={3}
            linkOpacity={0.5}
            linkHoverOpacity={0.8}
            linkContract={3}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={16}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1]]
            }}
            nodeTooltip={({ node }: any) => (
              <div className="bg-white px-3 py-2 shadow-lg rounded-md border border-gray-200">
                <div className="font-semibold text-sm">{node.id}</div>
              </div>
            )}
            linkTooltip={({ link }: any) => (
              <div className="bg-white px-3 py-2 shadow-lg rounded-md border border-gray-200">
                <div className="font-semibold text-sm">{link.source.id} → {link.target.id}</div>
                <div className="text-xs text-gray-600">
                  Value: ₱{link.formattedValue}
                </div>
              </div>
            )}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-2 text-sm">No substitution data available</p>
            </div>
          </div>
        )}
      </div>
    </DataBadgeWrapper>
  );
};
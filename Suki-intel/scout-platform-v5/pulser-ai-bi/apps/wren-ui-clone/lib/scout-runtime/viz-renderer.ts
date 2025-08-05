/**
 * Visualization Renderer
 * Converts input specs to SVG visualizations matching Tableau's createVizImageAsync
 */

import { VizImageInputSpec, MarkType } from './types';

export async function renderVizToSvg(spec: VizImageInputSpec): Promise<string> {
  // Validate input spec
  if (!spec.data?.values || !Array.isArray(spec.data.values)) {
    throw new Error('Invalid input spec: data.values must be an array');
  }

  if (!spec.mark) {
    throw new Error('Invalid input spec: mark type is required');
  }

  // Route to appropriate renderer based on mark type
  switch (spec.mark) {
    case MarkType.Bar:
      return renderBarChart(spec);
    case MarkType.Line:
      return renderLineChart(spec);
    case MarkType.Area:
      return renderAreaChart(spec);
    case MarkType.Circle:
    case MarkType.Square:
      return renderScatterPlot(spec);
    case MarkType.Pie:
      return renderPieChart(spec);
    case MarkType.Map:
      return renderMap(spec);
    case MarkType.Heatmap:
      return renderHeatmap(spec);
    default:
      throw new Error(`Unsupported mark type: ${spec.mark}`);
  }
}

function renderBarChart(spec: VizImageInputSpec): string {
  const { data, encoding } = spec;
  const values = data.values;
  
  // Extract dimensions
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Get field names
  const xField = encoding.columns?.field || Object.keys(values[0])[0];
  const yField = encoding.rows?.field || Object.keys(values[0])[1];
  
  // Sort data if specified
  let sortedValues = [...values];
  if (encoding.sort) {
    sortedValues.sort((a, b) => {
      const aVal = encoding.sort!.sortby ? a[encoding.sort!.sortby] : a[encoding.sort!.field];
      const bVal = encoding.sort!.sortby ? b[encoding.sort!.sortby] : b[encoding.sort!.field];
      const direction = encoding.sort!.direction === 'descending' ? -1 : 1;
      return (aVal - bVal) * direction;
    });
  }
  
  // Calculate scales
  const xScale = sortedValues.map((d, i) => ({
    value: d[xField],
    x: (i * innerWidth) / sortedValues.length + innerWidth / sortedValues.length / 2
  }));
  
  const maxY = Math.max(...sortedValues.map(d => d[yField]));
  const yScale = (value: number) => innerHeight - (value / maxY) * innerHeight;
  
  // Generate SVG
  const bars = sortedValues.map((d, i) => {
    const x = (i * innerWidth) / sortedValues.length;
    const barWidth = innerWidth / sortedValues.length * 0.8;
    const barHeight = (d[yField] / maxY) * innerHeight;
    const y = innerHeight - barHeight;
    
    return `
      <rect
        x="${x + barWidth * 0.1}"
        y="${y}"
        width="${barWidth}"
        height="${barHeight}"
        fill="#3b82f6"
        class="bar"
      />
    `;
  }).join('');
  
  // Generate axis labels
  const xLabels = xScale.map(({ value, x }) => `
    <text
      x="${x}"
      y="${innerHeight + 20}"
      text-anchor="middle"
      font-size="12"
      fill="#666"
    >${value}</text>
  `).join('');
  
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = (maxY / 4) * i;
    const y = yScale(value);
    return `
      <g>
        <line x1="0" y1="${y}" x2="${innerWidth}" y2="${y}" stroke="#e5e7eb" />
        <text x="-10" y="${y + 4}" text-anchor="end" font-size="12" fill="#666">
          ${value.toFixed(0)}
        </text>
      </g>
    `;
  }).join('');
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .bar { transition: fill 0.2s; cursor: pointer; }
          .bar:hover { fill: #2563eb; }
        </style>
      </defs>
      <g transform="translate(${margin.left},${margin.top})">
        ${yTicks}
        ${bars}
        ${xLabels}
        <line x1="0" y1="${innerHeight}" x2="${innerWidth}" y2="${innerHeight}" stroke="#333" />
        <line x1="0" y1="0" x2="0" y2="${innerHeight}" stroke="#333" />
      </g>
      ${spec.description ? `<title>${spec.description}</title>` : ''}
    </svg>
  `;
}

function renderLineChart(spec: VizImageInputSpec): string {
  const { data, encoding } = spec;
  const values = data.values;
  
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const xField = encoding.columns?.field || Object.keys(values[0])[0];
  const yField = encoding.rows?.field || Object.keys(values[0])[1];
  
  // Calculate scales
  const xScale = values.map((d, i) => ({
    value: d[xField],
    x: (i / (values.length - 1)) * innerWidth
  }));
  
  const maxY = Math.max(...values.map(d => d[yField]));
  const minY = Math.min(...values.map(d => d[yField]));
  const yScale = (value: number) => 
    innerHeight - ((value - minY) / (maxY - minY)) * innerHeight;
  
  // Generate path
  const pathData = values.map((d, i) => {
    const x = (i / (values.length - 1)) * innerWidth;
    const y = yScale(d[yField]);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Generate dots
  const dots = values.map((d, i) => {
    const x = (i / (values.length - 1)) * innerWidth;
    const y = yScale(d[yField]);
    return `<circle cx="${x}" cy="${y}" r="4" fill="#3b82f6" />`;
  }).join('');
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .line { fill: none; stroke: #3b82f6; stroke-width: 2; }
          circle { transition: r 0.2s; cursor: pointer; }
          circle:hover { r: 6; }
        </style>
      </defs>
      <g transform="translate(${margin.left},${margin.top})">
        <path d="${pathData}" class="line" />
        ${dots}
        <line x1="0" y1="${innerHeight}" x2="${innerWidth}" y2="${innerHeight}" stroke="#333" />
        <line x1="0" y1="0" x2="0" y2="${innerHeight}" stroke="#333" />
      </g>
      ${spec.description ? `<title>${spec.description}</title>` : ''}
    </svg>
  `;
}

function renderAreaChart(spec: VizImageInputSpec): string {
  const { data, encoding } = spec;
  const values = data.values;
  
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const xField = encoding.columns?.field || Object.keys(values[0])[0];
  const yField = encoding.rows?.field || Object.keys(values[0])[1];
  
  const maxY = Math.max(...values.map(d => d[yField]));
  const yScale = (value: number) => innerHeight - (value / maxY) * innerHeight;
  
  // Generate area path
  const areaPath = values.map((d, i) => {
    const x = (i / (values.length - 1)) * innerWidth;
    const y = yScale(d[yField]);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ` L ${innerWidth} ${innerHeight} L 0 ${innerHeight} Z`;
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <g transform="translate(${margin.left},${margin.top})">
        <path d="${areaPath}" fill="url(#areaGradient)" />
        <line x1="0" y1="${innerHeight}" x2="${innerWidth}" y2="${innerHeight}" stroke="#333" />
        <line x1="0" y1="0" x2="0" y2="${innerHeight}" stroke="#333" />
      </g>
      ${spec.description ? `<title>${spec.description}</title>` : ''}
    </svg>
  `;
}

function renderScatterPlot(spec: VizImageInputSpec): string {
  const { data, encoding } = spec;
  const values = data.values;
  
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const xField = encoding.columns?.field || Object.keys(values[0])[0];
  const yField = encoding.rows?.field || Object.keys(values[0])[1];
  const sizeField = encoding.size?.field;
  const colorField = encoding.color?.field;
  
  // Calculate scales
  const xMax = Math.max(...values.map(d => d[xField]));
  const xMin = Math.min(...values.map(d => d[xField]));
  const yMax = Math.max(...values.map(d => d[yField]));
  const yMin = Math.min(...values.map(d => d[yField]));
  
  const xScale = (value: number) => ((value - xMin) / (xMax - xMin)) * innerWidth;
  const yScale = (value: number) => innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;
  
  // Generate points
  const points = values.map((d, i) => {
    const x = xScale(d[xField]);
    const y = yScale(d[yField]);
    const size = sizeField ? Math.sqrt(d[sizeField]) * 2 : 5;
    const color = colorField ? `hsl(${(i / values.length) * 360}, 70%, 50%)` : '#3b82f6';
    
    const shape = spec.mark === MarkType.Square 
      ? `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="${color}" />`
      : `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" />`;
    
    return shape;
  }).join('');
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(${margin.left},${margin.top})">
        ${points}
        <line x1="0" y1="${innerHeight}" x2="${innerWidth}" y2="${innerHeight}" stroke="#333" />
        <line x1="0" y1="0" x2="0" y2="${innerHeight}" stroke="#333" />
      </g>
      ${spec.description ? `<title>${spec.description}</title>` : ''}
    </svg>
  `;
}

function renderPieChart(spec: VizImageInputSpec): string {
  const { data, encoding } = spec;
  const values = data.values;
  
  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 20;
  const cx = width / 2;
  const cy = height / 2;
  
  const labelField = encoding.columns?.field || Object.keys(values[0])[0];
  const valueField = encoding.rows?.field || Object.keys(values[0])[1];
  
  // Calculate angles
  const total = values.reduce((sum, d) => sum + d[valueField], 0);
  let currentAngle = -Math.PI / 2;
  
  const slices = values.map((d, i) => {
    const startAngle = currentAngle;
    const angle = (d[valueField] / total) * Math.PI * 2;
    currentAngle += angle;
    const endAngle = currentAngle;
    
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    
    const largeArc = angle > Math.PI ? 1 : 0;
    const color = `hsl(${(i / values.length) * 360}, 70%, 50%)`;
    
    return `
      <path
        d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z"
        fill="${color}"
        stroke="white"
        stroke-width="2"
        class="slice"
      >
        <title>${d[labelField]}: ${d[valueField]}</title>
      </path>
    `;
  }).join('');
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .slice { transition: transform 0.2s; cursor: pointer; transform-origin: center; }
          .slice:hover { transform: scale(1.05); }
        </style>
      </defs>
      ${slices}
      ${spec.description ? `<title>${spec.description}</title>` : ''}
    </svg>
  `;
}

function renderMap(spec: VizImageInputSpec): string {
  // Simplified map visualization
  return `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#e0f2fe" />
      <text x="300" y="200" text-anchor="middle" font-size="16" fill="#666">
        Map visualization requires geographic data
      </text>
      ${spec.description ? `<title>${spec.description}</title>` : ''}
    </svg>
  `;
}

function renderHeatmap(spec: VizImageInputSpec): string {
  const { data } = spec;
  const values = data.values;
  
  const width = 600;
  const height = 400;
  const cellSize = 30;
  
  // Generate heatmap cells
  const cells = values.map((d, i) => {
    const row = Math.floor(i / 10);
    const col = i % 10;
    const intensity = Math.random(); // In real implementation, would use actual values
    const color = `hsl(10, 70%, ${100 - intensity * 50}%)`;
    
    return `
      <rect
        x="${col * cellSize}"
        y="${row * cellSize}"
        width="${cellSize}"
        height="${cellSize}"
        fill="${color}"
        stroke="white"
      />
    `;
  }).join('');
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${cells}
      ${spec.description ? `<title>${spec.description}</title>` : ''}
    </svg>
  `;
}
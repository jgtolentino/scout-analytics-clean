/**
 * Export Module
 * Handles exporting dashboards to various formats
 */

import { DashboardContent } from './types';

export async function exportDashboard(
  dashboardContent: DashboardContent,
  format: 'pdf' | 'png' | 'xlsx' | 'pptx'
): Promise<Blob> {
  switch (format) {
    case 'pdf':
      return exportToPDF(dashboardContent);
    case 'png':
      return exportToPNG(dashboardContent);
    case 'xlsx':
      return exportToExcel(dashboardContent);
    case 'pptx':
      return exportToPowerPoint(dashboardContent);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

async function exportToPDF(dashboardContent: DashboardContent): Promise<Blob> {
  // In a real implementation, would use a library like jsPDF or puppeteer
  // For now, create a simple HTML representation
  
  const html = await generateHTMLReport(dashboardContent);
  
  // Convert HTML to PDF (simulated)
  const pdfContent = `%PDF-1.4
Dashboard Export
${html}
%%EOF`;
  
  return new Blob([pdfContent], { type: 'application/pdf' });
}

async function exportToPNG(dashboardContent: DashboardContent): Promise<Blob> {
  // Create canvas and render dashboard
  const canvas = document.createElement('canvas');
  canvas.width = dashboardContent.dashboard.size.width;
  canvas.height = dashboardContent.dashboard.size.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Draw dashboard background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw dashboard title
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.fillText(dashboardContent.dashboard.name, 20, 40);
  
  // Draw zones
  dashboardContent.dashboard.objects.forEach(obj => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.strokeRect(
      obj.position.x,
      obj.position.y,
      obj.size.width,
      obj.size.height
    );
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText(obj.name, obj.position.x + 10, obj.position.y + 20);
  });
  
  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob());
    }, 'image/png');
  });
}

async function exportToExcel(dashboardContent: DashboardContent): Promise<Blob> {
  // Create Excel file structure (simplified)
  const worksheets: any[] = [];
  
  // Add summary sheet
  worksheets.push({
    name: 'Dashboard Summary',
    data: [
      ['Dashboard Name', dashboardContent.dashboard.name],
      ['Export Date', new Date().toISOString()],
      ['Total Zones', dashboardContent.dashboard.objects.length],
      [''],
      ['Zone Name', 'Type', 'Position', 'Size']
    ]
  });
  
  // Add zone details
  dashboardContent.dashboard.objects.forEach(obj => {
    worksheets[0].data.push([
      obj.name,
      obj.type,
      `${obj.position.x},${obj.position.y}`,
      `${obj.size.width}x${obj.size.height}`
    ]);
  });
  
  // Add data sheets for each worksheet
  for (const worksheet of dashboardContent.dashboard.worksheets) {
    const data = await worksheet.getSummaryDataAsync();
    
    worksheets.push({
      name: worksheet.name,
      data: [
        data.columns.map(col => col.fieldName),
        ...data.data.map(row => row.map(cell => cell.formattedValue || cell.value))
      ]
    });
  }
  
  // Create simple CSV representation (in production, would use proper Excel library)
  const csvContent = worksheets.map(sheet => {
    const csv = sheet.data.map((row: any[]) => row.join(',')).join('\n');
    return `Sheet: ${sheet.name}\n${csv}\n\n`;
  }).join('');
  
  return new Blob([csvContent], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

async function exportToPowerPoint(dashboardContent: DashboardContent): Promise<Blob> {
  // Create PowerPoint structure (simplified)
  const slides: any[] = [];
  
  // Title slide
  slides.push({
    type: 'title',
    title: dashboardContent.dashboard.name,
    subtitle: `Generated on ${new Date().toLocaleDateString()}`
  });
  
  // Overview slide
  slides.push({
    type: 'content',
    title: 'Dashboard Overview',
    content: [
      `Total Visualizations: ${dashboardContent.dashboard.objects.length}`,
      `Worksheets: ${dashboardContent.dashboard.worksheets.length}`,
      `Parameters: ${(await dashboardContent.dashboard.getParametersAsync()).length}`,
      `Filters: ${(await dashboardContent.dashboard.getFiltersAsync()).length}`
    ]
  });
  
  // Zone slides
  dashboardContent.dashboard.objects.forEach(obj => {
    slides.push({
      type: 'visualization',
      title: obj.name,
      visualization: {
        type: obj.type,
        config: obj.zoneConfig
      }
    });
  });
  
  // Create simple text representation (in production, would use proper PPTX library)
  const pptxContent = slides.map((slide, i) => {
    return `Slide ${i + 1}: ${slide.title}\n${JSON.stringify(slide, null, 2)}\n---\n`;
  }).join('\n');
  
  return new Blob([pptxContent], { 
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
  });
}

async function generateHTMLReport(dashboardContent: DashboardContent): Promise<string> {
  const parameters = await dashboardContent.dashboard.getParametersAsync();
  const filters = await dashboardContent.dashboard.getFiltersAsync();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${dashboardContent.dashboard.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .zone { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
        .metadata { background: #f5f5f5; padding: 10px; margin: 10px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>
      <h1>${dashboardContent.dashboard.name}</h1>
      
      <div class="metadata">
        <h2>Dashboard Information</h2>
        <p>Export Date: ${new Date().toLocaleString()}</p>
        <p>Size: ${dashboardContent.dashboard.size.width} x ${dashboardContent.dashboard.size.height}</p>
        <p>Total Zones: ${dashboardContent.dashboard.objects.length}</p>
      </div>
      
      <div class="metadata">
        <h2>Active Parameters</h2>
        <ul>
          ${parameters.map(p => `
            <li><strong>${p.name}:</strong> ${p.currentValue.formattedValue}</li>
          `).join('')}
        </ul>
      </div>
      
      <div class="metadata">
        <h2>Active Filters</h2>
        <ul>
          ${filters.map(f => `
            <li><strong>${f.fieldName}:</strong> ${f.appliedValues?.map(v => v.formattedValue).join(', ') || 'All'}</li>
          `).join('')}
        </ul>
      </div>
      
      <h2>Dashboard Zones</h2>
      ${dashboardContent.dashboard.objects.map(obj => `
        <div class="zone">
          <h3>${obj.name}</h3>
          <p>Type: ${obj.type}</p>
          <p>Position: (${obj.position.x}, ${obj.position.y})</p>
          <p>Size: ${obj.size.width} x ${obj.size.height}</p>
          ${obj.zoneConfig ? `
            <p>Configuration: ${JSON.stringify(obj.zoneConfig, null, 2)}</p>
          ` : ''}
        </div>
      `).join('')}
      
      <h2>Data Tables</h2>
      ${await generateDataTables(dashboardContent)}
    </body>
    </html>
  `;
}

async function generateDataTables(dashboardContent: DashboardContent): Promise<string> {
  const tables: string[] = [];
  
  for (const worksheet of dashboardContent.dashboard.worksheets) {
    const data = await worksheet.getSummaryDataAsync({ maxRows: 50 });
    
    tables.push(`
      <div class="zone">
        <h3>${worksheet.name}</h3>
        <table>
          <thead>
            <tr>
              ${data.columns.map(col => `<th>${col.fieldName}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.data.slice(0, 10).map(row => `
              <tr>
                ${row.map(cell => `<td>${cell.formattedValue || cell.value}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p><em>Showing ${Math.min(10, data.data.length)} of ${data.totalRowCount} rows</em></p>
      </div>
    `);
  }
  
  return tables.join('')
}
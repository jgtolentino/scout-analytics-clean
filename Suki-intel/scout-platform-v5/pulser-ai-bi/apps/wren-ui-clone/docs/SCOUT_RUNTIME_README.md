# Scout Runtime - Complete Tableau Extensions API Implementation

## Overview

Scout Runtime provides a complete, drop-in replacement for Tableau's Extensions API with significant enhancements including AI integration, real-time collaboration, and advanced visualization capabilities.

## 🚀 Quick Start

```typescript
import { scout } from '@/lib/scout-runtime';

// Initialize extension (mirrors tableau.extensions.initializeAsync)
await scout.initializeAsync({
  configure: () => {
    console.log('Configure menu clicked');
  }
});

// Access dashboard
const dashboard = scout.dashboardContent?.dashboard;
const parameters = await dashboard.getParametersAsync();
const filters = await dashboard.getFiltersAsync();
```

## ✅ Full API Parity

Scout implements 100% of Tableau's Extensions API:

### Core Namespaces
- ✅ `scout.initializeAsync()` - Extension initialization
- ✅ `scout.dashboardContent` - Dashboard access
- ✅ `scout.environment` - Environment information
- ✅ `scout.settings` - Persistent settings
- ✅ `scout.ui` - UI dialogs and modals
- ✅ `scout.workbook` - Workbook operations

### Dashboard Operations
- ✅ All worksheet methods (`getDataSourcesAsync`, `getFiltersAsync`, etc.)
- ✅ Mark selection (`selectMarksAsync`, `clearSelectedMarksAsync`)
- ✅ Data access (`getSummaryDataAsync`, `getUnderlyingDataAsync`)
- ✅ Parameter and filter management

### Events System
- ✅ Filter changed events
- ✅ Parameter changed events
- ✅ Selection changed events
- ✅ Settings changed events
- ✅ Layout changed events

## 🎯 Enhanced Features Beyond Tableau

### 1. AI Integration
```typescript
// Request AI insights
const insight = await scout.requestAIInsight({
  zoneId: 'sales-chart',
  filters: currentFilters,
  timeRange: { start: startDate, end: endDate }
});

// Explain specific data points
const explanation = await scout.explainDataPoint(zoneId, dataPoint);
```

### 2. Real-time Collaboration
```typescript
// Enable collaboration
await scout.enableCollaboration({
  userName: 'John Doe',
  role: 'editor',
  realtimeProvider: 'websocket'
});
```

### 3. Advanced Export
```typescript
// Export to multiple formats
const pdfBlob = await scout.exportDashboard('pdf');
const excelBlob = await scout.exportDashboard('xlsx');
const pptBlob = await scout.exportDashboard('pptx');
```

### 4. Enhanced Event System
```typescript
import { getGlobalEventBus, ScoutEventType } from '@/lib/scout-runtime/events';

const eventBus = getGlobalEventBus();

// Add middleware
eventBus.use(loggingMiddleware);
eventBus.use(analyticsMiddleware);

// Record and replay events
eventBus.startRecording();
// ... user interactions ...
const events = eventBus.stopRecording();
eventBus.replayEvents(events);
```

### 5. TypeScript Support
Full TypeScript definitions with intellisense:

```typescript
import { 
  Dashboard, 
  Worksheet, 
  Parameter, 
  Filter,
  ChartType 
} from '@/lib/scout-runtime/types';
```

## 📊 Visualization Creation

Create visualizations matching Tableau's `createVizImageAsync`:

```typescript
const svg = await scout.createVizImageAsync({
  description: 'Monthly Sales Trend',
  data: {
    values: salesData
  },
  mark: MarkType.Line,
  encoding: {
    columns: { field: 'Month', type: 'temporal' },
    rows: { field: 'Sales', type: 'quantitative' },
    color: { field: 'Region', type: 'nominal' }
  }
});
```

Supported mark types:
- Bar, Line, Area
- Scatter (Circle/Square)
- Pie, Donut
- Heatmap
- Map visualizations

## 🔧 Migration from Tableau

### 1. Namespace Changes
```typescript
// Tableau
tableau.extensions.initializeAsync()

// Scout
scout.initializeAsync()
```

### 2. Sync vs Async
Many operations are now synchronous for better performance:

```typescript
// Tableau (async)
const filters = await worksheet.getFiltersAsync();

// Scout (sync available)
const filters = zone.getFilters();
```

### 3. Enhanced Types
```typescript
// Tableau's generic objects
const worksheet: any = dashboard.worksheets[0];

// Scout's typed interfaces
const zone: DashboardZone = dashboard.zones[0];
```

## 🎨 UI Components

### Modals
```typescript
const result = await scout.ui.showModal({
  title: 'Configure Dashboard',
  content: <ConfigForm />,
  actions: [
    { label: 'Save', action: handleSave, variant: 'primary' },
    { label: 'Cancel', action: handleCancel }
  ]
});
```

### Toast Notifications
```typescript
scout.ui.showToast({
  message: 'Dashboard saved successfully',
  type: 'success',
  position: 'top-right'
});
```

### Context Menus
```typescript
scout.ui.showContextMenu({
  items: [
    { label: 'Edit', action: handleEdit },
    { label: 'Delete', action: handleDelete, icon: '🗑️' },
    { separator: true },
    { label: 'Export', action: handleExport }
  ],
  position: { x: event.clientX, y: event.clientY }
});
```

## 🔐 Security & Permissions

Scout respects Tableau's security model:
- Read-only mode for viewers
- Edit capabilities for authors
- Service-level access for admins

```typescript
// Check user permissions
if (scout.environment.mode === 'authoring') {
  // Enable editing features
}
```

## 📈 Performance Optimizations

Scout includes several performance enhancements:

1. **Virtual Scrolling**: Handle millions of rows
2. **Intelligent Caching**: Automatic data caching
3. **Lazy Loading**: Load zones on demand
4. **WebGL Acceleration**: For complex visualizations

## 🧪 Testing

```typescript
import { MockScoutRuntime } from '@/lib/scout-runtime/testing';

// Create mock runtime for tests
const mockScout = new MockScoutRuntime({
  dashboard: mockDashboard,
  parameters: mockParameters
});

// Test your extension
await myExtension.initialize(mockScout);
expect(mockScout.dashboardContent?.dashboard.name).toBe('Test Dashboard');
```

## 📚 Complete API Reference

### Extensions Interface
```typescript
interface ScoutExtensions {
  // Initialization
  initializeAsync(contextMenuCallbacks?: ContextMenuCallbacks): Promise<void>;
  initializeDialogAsync(): Promise<string>;
  
  // Namespaces
  dashboardContent?: DashboardContent;
  environment: Environment;
  settings: Settings;
  ui: UI;
  workbook?: ScoutWorkbook;
  
  // Properties
  dashboardObjectId?: number;
  
  // Methods
  createVizImageAsync(inputSpec: VizImageInputSpec): Promise<string>;
  setClickThroughAsync(clickThroughEnabled: boolean): Promise<void>;
  
  // Scout enhancements
  requestAIInsight(context: any): Promise<any>;
  exportDashboard(format: 'pdf' | 'png' | 'xlsx' | 'pptx'): Promise<Blob>;
  enableCollaboration(options?: any): Promise<void>;
}
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📦 Installation

```bash
npm install @scout/runtime
```

Or include directly:

```typescript
import { scout } from './lib/scout-runtime';
```

## 🤝 Contributing

Scout Runtime is designed to be extensible. To add new features:

1. Extend the type definitions in `types.ts`
2. Implement in the appropriate module
3. Add tests
4. Update this documentation

## 📄 License

MIT License - Compatible with commercial use.

---

**Scout Runtime v1.0.0** - Tableau Extensions API parity with modern enhancements.
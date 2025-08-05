/**
 * Dashboard Content Implementation
 * Provides access to dashboard objects, worksheets, parameters, and filters
 */

import { EventEmitter } from 'events';
import {
  DashboardContent,
  Dashboard,
  Worksheet,
  DashboardObject,
  Parameter,
  Filter,
  DashboardObjectType,
  SheetType,
  DataTable,
  MarksCollection,
  SelectionUpdateType,
  DataSource,
  GetDataOptions,
  ZoneConfig,
  ChartType
} from './types';

/**
 * Worksheet implementation
 */
class WorksheetImpl implements Worksheet {
  name: string;
  sheetType = SheetType.Worksheet;
  size: { behavior: string; maxSize?: number; minSize?: number };
  private _dataSources: DataSource[] = [];
  private _filters: Filter[] = [];
  private _selectedMarks: Set<string> = new Set();
  private _data: Map<string, any[]> = new Map();

  constructor(name: string, config?: any) {
    this.name = name;
    this.size = config?.size || { behavior: 'automatic' };
    this._initializeData();
  }

  async getDataSourcesAsync(): Promise<DataSource[]> {
    // In real implementation, would fetch from backend
    return this._dataSources;
  }

  async getFiltersAsync(): Promise<Filter[]> {
    return this._filters;
  }

  async getSummaryDataAsync(options?: GetDataOptions): Promise<DataTable> {
    // Simulate fetching summary data
    const data = this._generateSummaryData(options);
    return data;
  }

  async getUnderlyingDataAsync(options?: GetDataOptions): Promise<DataTable> {
    // Simulate fetching detailed data
    const data = this._generateDetailData(options);
    return data;
  }

  async getSelectedMarksAsync(): Promise<MarksCollection> {
    const marks = Array.from(this._selectedMarks).map(id => ({
      tupleId: parseInt(id),
      pairs: this._getMarkPairs(id)
    }));
    
    return { data: marks };
  }

  async selectMarksAsync(
    fieldName: string,
    values: any[],
    updateType: SelectionUpdateType
  ): Promise<void> {
    const markIds = this._findMarkIds(fieldName, values);
    
    switch (updateType) {
      case SelectionUpdateType.Replace:
        this._selectedMarks.clear();
        markIds.forEach(id => this._selectedMarks.add(id));
        break;
      case SelectionUpdateType.Add:
        markIds.forEach(id => this._selectedMarks.add(id));
        break;
      case SelectionUpdateType.Remove:
        markIds.forEach(id => this._selectedMarks.delete(id));
        break;
    }
    
    // Emit selection changed event
    this._emitSelectionChanged();
  }

  async clearSelectedMarksAsync(): Promise<void> {
    this._selectedMarks.clear();
    this._emitSelectionChanged();
  }

  private _initializeData(): void {
    // Initialize with sample data
    this._data.set('sales', [
      { product: 'Widget A', amount: 1000, region: 'North' },
      { product: 'Widget B', amount: 1500, region: 'South' },
      { product: 'Widget C', amount: 2000, region: 'East' }
    ]);
  }

  private _generateSummaryData(options?: GetDataOptions): DataTable {
    const rows = options?.maxRows || 100;
    const data = [];
    
    for (let i = 0; i < Math.min(rows, 100); i++) {
      data.push([
        { value: `Product ${i}`, formattedValue: `Product ${i}` },
        { value: Math.random() * 1000, formattedValue: `$${(Math.random() * 1000).toFixed(2)}` }
      ]);
    }
    
    return {
      name: 'Summary Data',
      data,
      columns: [
        { fieldName: 'Product', dataType: 'string' as any, isReferenced: true, index: 0 },
        { fieldName: 'Sales', dataType: 'float' as any, isReferenced: true, index: 1 }
      ],
      totalRowCount: data.length,
      isTotalRowCountLimited: false
    };
  }

  private _generateDetailData(options?: GetDataOptions): DataTable {
    const rows = options?.maxRows || 1000;
    const data = [];
    
    for (let i = 0; i < Math.min(rows, 1000); i++) {
      data.push([
        { value: i, formattedValue: i.toString() },
        { value: `Product ${i % 10}`, formattedValue: `Product ${i % 10}` },
        { value: Math.random() * 100, formattedValue: (Math.random() * 100).toFixed(2) },
        { value: new Date(), formattedValue: new Date().toLocaleDateString() }
      ]);
    }
    
    return {
      name: 'Detail Data',
      data,
      columns: [
        { fieldName: 'ID', dataType: 'int' as any, isReferenced: true, index: 0 },
        { fieldName: 'Product', dataType: 'string' as any, isReferenced: true, index: 1 },
        { fieldName: 'Quantity', dataType: 'float' as any, isReferenced: true, index: 2 },
        { fieldName: 'Date', dataType: 'date' as any, isReferenced: true, index: 3 }
      ],
      totalRowCount: data.length,
      isTotalRowCountLimited: rows > 1000
    };
  }

  private _findMarkIds(fieldName: string, values: any[]): string[] {
    // Simulate finding marks by field values
    const ids: string[] = [];
    const data = this._data.get('sales') || [];
    
    data.forEach((item, index) => {
      if (values.includes(item[fieldName])) {
        ids.push(index.toString());
      }
    });
    
    return ids;
  }

  private _getMarkPairs(markId: string): Array<{ fieldName: string; value: any }> {
    const data = this._data.get('sales') || [];
    const item = data[parseInt(markId)];
    
    if (!item) return [];
    
    return Object.entries(item).map(([key, value]) => ({
      fieldName: key,
      value: { value, formattedValue: value?.toString() }
    }));
  }

  private _emitSelectionChanged(): void {
    // Emit to global event bus
    if (typeof window !== 'undefined' && (window as any).scoutEventBus) {
      (window as any).scoutEventBus.emit('selectionChanged', {
        worksheet: this.name,
        selectedMarks: Array.from(this._selectedMarks)
      });
    }
  }
}

/**
 * Dashboard implementation
 */
class DashboardImpl implements Dashboard {
  name: string;
  worksheets: Worksheet[] = [];
  objects: DashboardObject[] = [];
  sheetType = SheetType.Dashboard;
  size: { width: number; height: number };
  private _parameters: Parameter[] = [];
  private _filters: Filter[] = [];

  constructor(config?: any) {
    this.name = config?.name || 'Scout Dashboard';
    this.size = config?.size || { width: 1200, height: 800 };
    this._initializeDashboard();
  }

  async getParametersAsync(): Promise<Parameter[]> {
    return this._parameters;
  }

  async getFiltersAsync(): Promise<Filter[]> {
    // Aggregate filters from all worksheets
    const allFilters: Filter[] = [...this._filters];
    
    for (const worksheet of this.worksheets) {
      const wsFilters = await worksheet.getFiltersAsync();
      allFilters.push(...wsFilters);
    }
    
    return allFilters;
  }

  private _initializeDashboard(): void {
    // Create default zones
    this._createDefaultZones();
    
    // Initialize parameters
    this._parameters = [
      {
        id: 'date-range',
        name: 'Date Range',
        currentValue: { value: 'last-30-days', formattedValue: 'Last 30 Days' },
        dataType: 'string' as any,
        allowableValues: {
          type: 'list',
          allowableValues: [
            { value: 'today', formattedValue: 'Today' },
            { value: 'yesterday', formattedValue: 'Yesterday' },
            { value: 'last-7-days', formattedValue: 'Last 7 Days' },
            { value: 'last-30-days', formattedValue: 'Last 30 Days' },
            { value: 'last-90-days', formattedValue: 'Last 90 Days' }
          ]
        }
      }
    ];
  }

  private _createDefaultZones(): void {
    // KPI Zone
    this.objects.push({
      id: 1,
      type: DashboardObjectType.KPICard,
      name: 'Key Metrics',
      position: { x: 0, y: 0 },
      size: { width: 300, height: 100 },
      isFloating: false,
      isVisible: true,
      zoneConfig: {
        type: 'kpi',
        refreshInterval: 30000,
        aiEnabled: true
      }
    });

    // Main Chart Zone
    const mainChart = new WorksheetImpl('Sales Overview');
    this.worksheets.push(mainChart);
    
    this.objects.push({
      id: 2,
      type: DashboardObjectType.Worksheet,
      name: 'Sales Overview',
      position: { x: 0, y: 120 },
      size: { width: 800, height: 400 },
      worksheet: mainChart,
      isFloating: false,
      isVisible: true,
      zoneConfig: {
        type: 'chart',
        chartType: ChartType.BAR,
        drillDownEnabled: true,
        exportEnabled: true
      }
    });

    // Filter Zone
    this.objects.push({
      id: 3,
      type: DashboardObjectType.QuickFilter,
      name: 'Filters',
      position: { x: 820, y: 0 },
      size: { width: 280, height: 300 },
      isFloating: false,
      isVisible: true,
      zoneConfig: {
        type: 'filter',
        dataSource: 'sales'
      }
    });

    // AI Insights Panel
    this.objects.push({
      id: 4,
      type: DashboardObjectType.AIInsightPanel,
      name: 'AI Insights',
      position: { x: 820, y: 320 },
      size: { width: 280, height: 200 },
      isFloating: false,
      isVisible: true,
      zoneConfig: {
        type: 'ai-insight',
        aiEnabled: true,
        refreshInterval: 60000
      }
    });
  }
}

/**
 * Dashboard Content Implementation
 */
export class DashboardContentImpl extends EventEmitter implements DashboardContent {
  dashboard: Dashboard;

  constructor() {
    super();
    this.dashboard = new DashboardImpl();
  }

  async initialize(): Promise<void> {
    // Load dashboard configuration
    await this._loadDashboardConfig();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Start auto-refresh if configured
    this._startAutoRefresh();
  }

  private async _loadDashboardConfig(): Promise<void> {
    // In real implementation, would load from backend or settings
    // For now, using default configuration
  }

  private _setupEventListeners(): void {
    // Listen for parameter changes
    if (typeof window !== 'undefined' && (window as any).scoutEventBus) {
      const eventBus = (window as any).scoutEventBus;
      
      eventBus.on('parameterChanged', (data: any) => {
        // Update parameter value
        const param = this.dashboard['_parameters'].find(p => p.id === data.parameterId);
        if (param) {
          param.currentValue = data.value;
          this.emit('parameterChanged', data);
        }
      });
      
      eventBus.on('filterChanged', (data: any) => {
        this.emit('filterChanged', data);
      });
    }
  }

  private _startAutoRefresh(): void {
    // Check each zone for refresh intervals
    this.dashboard.objects.forEach(obj => {
      if (obj.zoneConfig?.refreshInterval) {
        setInterval(() => {
          this._refreshZone(obj);
        }, obj.zoneConfig.refreshInterval);
      }
    });
  }

  private async _refreshZone(zone: DashboardObject): Promise<void> {
    if (zone.worksheet) {
      // Refresh worksheet data
      const data = await zone.worksheet.getSummaryDataAsync();
      this.emit('zoneRefreshed', { zoneId: zone.id, data });
    }
    
    if (zone.zoneConfig?.aiEnabled) {
      // Request AI insights
      this.emit('requestAIInsight', { zoneId: zone.id });
    }
  }
}
/**
 * Workbook Implementation
 * Provides access to sheets and workbook-level operations
 */

import { ScoutWorkbook, Worksheet, Dashboard, SheetType } from './types';
import { EventEmitter } from 'events';

export class WorkbookImpl extends EventEmitter implements ScoutWorkbook {
  name = 'Scout Workbook';
  activeSheet!: Worksheet | Dashboard;
  publishedSheetsInfo: Array<{
    name: string;
    sheetType: SheetType;
    isActive: boolean;
    isHidden: boolean;
    index: number;
  }> = [];
  
  private _sheets: Map<string, Worksheet | Dashboard> = new Map();
  private _theme: 'light' | 'dark' = 'light';

  async initialize(): Promise<void> {
    // Load workbook metadata
    await this._loadWorkbookInfo();
    
    // Set up theme
    this._detectTheme();
    
    // Set active sheet
    if (this.publishedSheetsInfo.length > 0) {
      const activeInfo = this.publishedSheetsInfo.find(s => s.isActive) || this.publishedSheetsInfo[0];
      const sheet = this._sheets.get(activeInfo.name);
      if (sheet) {
        this.activeSheet = sheet;
      }
    }
  }

  async activateSheetAsync(sheetNameOrIndex: string | number): Promise<Worksheet | Dashboard> {
    let sheet: Worksheet | Dashboard | undefined;
    
    if (typeof sheetNameOrIndex === 'string') {
      sheet = this._sheets.get(sheetNameOrIndex);
    } else {
      const info = this.publishedSheetsInfo[sheetNameOrIndex];
      if (info) {
        sheet = this._sheets.get(info.name);
      }
    }
    
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetNameOrIndex}`);
    }
    
    // Update active status
    this.publishedSheetsInfo.forEach(info => {
      info.isActive = info.name === sheet.name;
    });
    
    this.activeSheet = sheet;
    this.emit('activeSheetChanged', sheet);
    
    return sheet;
  }

  async revertAllAsync(): Promise<void> {
    // Revert all changes in the workbook
    this._sheets.forEach(sheet => {
      // In real implementation, would revert sheet state
      this.emit('sheetReverted', sheet.name);
    });
    
    this.emit('workbookReverted');
  }

  getTheme(): 'light' | 'dark' {
    return this._theme;
  }

  setTheme(theme: 'light' | 'dark'): void {
    this._theme = theme;
    
    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Save preference
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('scout-theme', theme);
    }
    
    this.emit('themeChanged', theme);
  }

  private async _loadWorkbookInfo(): Promise<void> {
    // In real implementation, would load from backend
    // For now, create default sheets
    
    // Create dashboard
    const dashboard = {
      name: 'Executive Overview',
      worksheets: [],
      objects: [],
      sheetType: SheetType.Dashboard as const,
      size: { width: 1200, height: 800 },
      getParametersAsync: async () => [],
      getFiltersAsync: async () => []
    };
    
    this._sheets.set(dashboard.name, dashboard as Dashboard);
    
    this.publishedSheetsInfo.push({
      name: dashboard.name,
      sheetType: SheetType.Dashboard,
      isActive: true,
      isHidden: false,
      index: 0
    });
    
    // Create worksheets
    const worksheetNames = [
      'Sales Analysis',
      'Customer Insights',
      'Product Performance',
      'Geographic Distribution'
    ];
    
    worksheetNames.forEach((name, index) => {
      const worksheet = this._createWorksheet(name);
      this._sheets.set(name, worksheet);
      
      this.publishedSheetsInfo.push({
        name,
        sheetType: SheetType.Worksheet,
        isActive: false,
        isHidden: false,
        index: index + 1
      });
    });
  }

  private _createWorksheet(name: string): Worksheet {
    return {
      name,
      sheetType: SheetType.Worksheet,
      size: { behavior: 'automatic' },
      getDataSourcesAsync: async () => [],
      getFiltersAsync: async () => [],
      getSummaryDataAsync: async () => ({
        name: 'Summary',
        data: [],
        columns: [],
        totalRowCount: 0,
        isTotalRowCountLimited: false
      }),
      getUnderlyingDataAsync: async () => ({
        name: 'Detail',
        data: [],
        columns: [],
        totalRowCount: 0,
        isTotalRowCountLimited: false
      }),
      getSelectedMarksAsync: async () => ({ data: [] }),
      selectMarksAsync: async () => {},
      clearSelectedMarksAsync: async () => {}
    };
  }

  private _detectTheme(): void {
    // Check saved preference
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('scout-theme');
      if (saved === 'light' || saved === 'dark') {
        this._theme = saved;
        return;
      }
    }
    
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._theme = isDark ? 'dark' : 'light';
    }
  }
}
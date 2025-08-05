/**
 * Scout Runtime API - Tableau-style API bindings for Scout Dashboard
 * Provides a consistent developer API mirroring Tableau Extensions API
 */

import { EventEmitter } from 'events';
import type { DashboardConfig, DashboardZoneType, Parameter, Filter } from '../components/Dashboard';

// Scout API Namespace - mirrors tableau.extensions
export class ScoutRuntime extends EventEmitter {
  private static instance: ScoutRuntime;
  private dashboardConfig: DashboardConfig | null = null;
  private zones: Map<string, DashboardZoneType> = new Map();
  private filters: Map<string, Filter> = new Map();
  private parameters: Map<string, Parameter> = new Map();
  private initialized: boolean = false;

  private constructor() {
    super();
  }

  static getInstance(): ScoutRuntime {
    if (!ScoutRuntime.instance) {
      ScoutRuntime.instance = new ScoutRuntime();
    }
    return ScoutRuntime.instance;
  }

  // Initialize the Scout runtime - mirrors tableau.extensions.initializeAsync()
  async initializeAsync(config?: DashboardConfig): Promise<void> {
    try {
      this.dashboardConfig = config || await this.loadConfig();
      this.parseConfiguration();
      this.initialized = true;
      this.emit('dashboard:initialized', this.dashboardConfig);
      return Promise.resolve();
    } catch (error) {
      this.emit('dashboard:error', error);
      throw error;
    }
  }

  // Dashboard content access - mirrors tableau.extensions.dashboardContent
  get dashboardContent() {
    return {
      dashboard: {
        name: this.dashboardConfig?.title || 'Untitled Dashboard',
        zones: Array.from(this.zones.values()),
        getZoneById: (id: string) => this.zones.get(id),
        worksheets: this.getWorksheets(), // Tableau compatibility
      },
      parameters: {
        getAll: () => Array.from(this.parameters.values()),
        getByName: (name: string) => 
          Array.from(this.parameters.values()).find(p => p.name === name),
        changeValueAsync: async (paramId: string, value: any) => {
          const param = this.parameters.get(paramId);
          if (param) {
            param.value = value;
            this.emit('parameter:changed', { parameter: param, value });
          }
        }
      },
      filters: {
        getAll: () => Array.from(this.filters.values()),
        getApplied: () => Array.from(this.filters.values()).filter(f => f.applied),
        applyFilterAsync: async (filterId: string, values: any) => {
          const filter = this.filters.get(filterId);
          if (filter) {
            filter.value = values;
            filter.applied = true;
            this.emit('filter:changed', { filter, values });
          }
        },
        clearFilterAsync: async (filterId: string) => {
          const filter = this.filters.get(filterId);
          if (filter) {
            filter.value = null;
            filter.applied = false;
            this.emit('filter:cleared', { filter });
          }
        }
      }
    };
  }

  // Settings API - mirrors tableau.extensions.settings
  get settings() {
    const storage = new Map<string, string>();
    
    return {
      get: (key: string): string | undefined => {
        return storage.get(key) || localStorage.getItem(`scout:${key}`) || undefined;
      },
      set: (key: string, value: string) => {
        storage.set(key, value);
        localStorage.setItem(`scout:${key}`, value);
        this.emit('settings:changed', { key, value });
      },
      getAll: (): Record<string, string> => {
        const all: Record<string, string> = {};
        storage.forEach((value, key) => {
          all[key] = value;
        });
        return all;
      },
      saveAsync: async () => {
        // Persist to Supabase or backend
        this.emit('settings:saved', storage);
        return Promise.resolve();
      },
      erase: (key: string) => {
        storage.delete(key);
        localStorage.removeItem(`scout:${key}`);
      }
    };
  }

  // Environment API - mirrors tableau.extensions.environment
  get environment() {
    return {
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      apiVersion: '1.0.0',
      dashboardVersion: this.dashboardConfig?.version || '1.0',
      locale: typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US',
      operatingSystem: this.getOS(),
      tableauVersion: 'Scout Dashboard 1.0', // For compatibility
      user: this.getCurrentUser(),
      organization: this.getOrganization(),
      theme: this.getTheme()
    };
  }

  // UI API - mirrors tableau.extensions.ui
  get ui() {
    return {
      displayDialogAsync: async (url: string, options?: any) => {
        this.emit('ui:dialog:open', { url, options });
        // Return promise that resolves when dialog closes
        return new Promise((resolve) => {
          this.once('ui:dialog:closed', resolve);
        });
      },
      closeDialog: (payload?: any) => {
        this.emit('ui:dialog:closed', payload);
      },
      showModal: (component: string, props?: any) => {
        this.emit('ui:modal:open', { component, props });
      },
      showToast: (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        this.emit('ui:toast', { message, type });
      }
    };
  }

  // Events API - Enhanced event system
  get events() {
    return {
      // Dashboard events
      onDashboardLayoutChanged: (handler: (...args: any[]) => void) => 
        this.on('dashboard:layout:changed', handler),
      onFilterChanged: (handler: (...args: any[]) => void) => 
        this.on('filter:changed', handler),
      onParameterChanged: (handler: (...args: any[]) => void) => 
        this.on('parameter:changed', handler),
      onSelectionChanged: (handler: (...args: any[]) => void) => 
        this.on('selection:changed', handler),
      
      // Zone events
      onZoneAdded: (handler: (...args: any[]) => void) => 
        this.on('zone:added', handler),
      onZoneRemoved: (handler: (...args: any[]) => void) => 
        this.on('zone:removed', handler),
      onZoneUpdated: (handler: (...args: any[]) => void) => 
        this.on('zone:updated', handler),
      
      // Data events
      onDataRefreshed: (handler: (...args: any[]) => void) => 
        this.on('data:refreshed', handler),
      onQueryExecuted: (handler: (...args: any[]) => void) => 
        this.on('query:executed', handler),
      
      // AI events
      onAIInsightGenerated: (handler: (...args: any[]) => void) => 
        this.on('ai:insight:generated', handler),
      onAIRecommendationAccepted: (handler: (...args: any[]) => void) => 
        this.on('ai:recommendation:accepted', handler),
      
      // Remove listener
      off: (event: string, handler: (...args: any[]) => void) => 
        this.off(event, handler)
    };
  }

  // Worksheet API - Tableau compatibility layer
  private getWorksheets() {
    return Array.from(this.zones.values())
      .filter(zone => zone.type === 'chart' || zone.type === 'table')
      .map(zone => this.createWorksheetProxy(zone));
  }

  private createWorksheetProxy(zone: DashboardZoneType) {
    return {
      name: zone.name,
      id: zone.id,
      getFiltersAsync: async () => {
        // Return filters that affect this zone
        return Array.from(this.filters.values())
          .filter(f => f.applied);
      },
      getDataSourcesAsync: async () => {
        return [{ name: zone.dataSource || 'default' }];
      },
      getSummaryDataAsync: async () => {
        // Emit event to request data
        this.emit('zone:data:requested', { zoneId: zone.id });
        return new Promise((resolve) => {
          this.once(`zone:data:${zone.id}`, resolve);
        });
      },
      getSelectedMarksAsync: async () => {
        // Return currently selected data points
        return [];
      },
      selectMarksAsync: async (marks: any[]) => {
        this.emit('marks:selected', { zoneId: zone.id, marks });
      },
      clearSelectedMarksAsync: async () => {
        this.emit('marks:cleared', { zoneId: zone.id });
      }
    };
  }

  // Helper methods
  private parseConfiguration() {
    if (!this.dashboardConfig) return;

    // Parse zones
    this.dashboardConfig.zones.forEach(zone => {
      this.zones.set(zone.id, zone);
    });

    // Parse parameters
    this.dashboardConfig.parameters.forEach(param => {
      this.parameters.set(param.id, param);
    });

    // Parse filters
    this.dashboardConfig.filters.forEach(filter => {
      this.filters.set(filter.id, filter);
    });
  }

  private async loadConfig(): Promise<DashboardConfig> {
    // Load from localStorage or backend
    const saved = localStorage.getItem('scout:dashboard:config');
    if (saved) {
      return JSON.parse(saved);
    }
    throw new Error('No dashboard configuration found');
  }

  private getCurrentUser() {
    // Get from Supabase auth or session
    return {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Dashboard User'
    };
  }

  private getOrganization() {
    return {
      id: 'org-123',
      name: 'TBWA',
      plan: 'enterprise'
    };
  }

  private getTheme() {
    return this.dashboardConfig?.theme?.colorScheme || 'light';
  }

  private getOS(): string {
    if (typeof navigator === 'undefined') return 'server';
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) return 'windows';
    if (platform.includes('mac')) return 'mac';
    if (platform.includes('linux')) return 'linux';
    return 'unknown';
  }

  // Public API methods
  updateZone(zoneId: string, updates: Partial<DashboardZoneType>) {
    const zone = this.zones.get(zoneId);
    if (zone) {
      Object.assign(zone, updates);
      this.emit('zone:updated', { zone, updates });
    }
  }

  addZone(zone: DashboardZoneType) {
    this.zones.set(zone.id, zone);
    this.emit('zone:added', { zone });
  }

  removeZone(zoneId: string) {
    const zone = this.zones.get(zoneId);
    if (zone) {
      this.zones.delete(zoneId);
      this.emit('zone:removed', { zone });
    }
  }

  // AI Integration methods
  async requestAIInsight(context: any) {
    this.emit('ai:insight:requested', context);
    return new Promise((resolve) => {
      this.once('ai:insight:generated', resolve);
    });
  }

  async explainDataPoint(zoneId: string, dataPoint: any) {
    this.emit('ai:explain:requested', { zoneId, dataPoint });
    return new Promise((resolve) => {
      this.once('ai:explain:generated', resolve);
    });
  }
}

// Export singleton instance
export const scout = ScoutRuntime.getInstance();

// Export types for TypeScript support
export type ScoutAPI = ScoutRuntime;

// Create an interface for dashboardContent getter return type
export interface ScoutDashboardContent {
  dashboard: {
    name: string;
    zones: DashboardZoneType[];
    getZoneById: (id: string) => DashboardZoneType | undefined;
    worksheets: any[];
  };
  parameters: any;
  filters: any;
}

export interface ScoutEnvironment {
  mode: string;
  apiVersion: string;
  dashboardVersion: string;
  locale: string;
  operatingSystem: string;
  tableauVersion: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  organization: {
    id: string;
    name: string;
    plan: string;
  };
  theme: 'light' | 'dark' | 'auto';
}

export interface ScoutUI {
  displayErrorDialog: (title: string, message: string) => Promise<void>;
  displayConfirmationDialog: (message: string) => Promise<boolean>;
  showNotification: (message: string, type?: string) => void;
  closeDialog: () => void;
}

export interface ScoutEvents {
  onDashboardLayoutChanged: (handler: (...args: any[]) => void) => void;
  onFilterChanged: (handler: (...args: any[]) => void) => void;
  onParameterChanged: (handler: (...args: any[]) => void) => void;
  onSelectionChanged: (handler: (...args: any[]) => void) => void;
  onZoneAdded: (handler: (...args: any[]) => void) => void;
  onZoneRemoved: (handler: (...args: any[]) => void) => void;
  onZoneUpdated: (handler: (...args: any[]) => void) => void;
  onDataRefreshed: (handler: (...args: any[]) => void) => void;
  onQueryExecuted: (handler: (...args: any[]) => void) => void;
  onAIInsightGenerated: (handler: (...args: any[]) => void) => void;
  onAIRecommendationAccepted: (handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
}
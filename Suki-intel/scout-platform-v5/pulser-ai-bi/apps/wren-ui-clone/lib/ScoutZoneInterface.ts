/**
 * Scout Zone Interface - Standard interface for all dashboard zones
 * Implements lifecycle hooks and data management
 */

import { ReactElement } from 'react';
import { ScoutEventType } from './scoutEventBus';

// Zone lifecycle states
export enum ZoneLifecycleState {
  CREATED = 'created',
  INITIALIZING = 'initializing',
  READY = 'ready',
  LOADING = 'loading',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

// Zone context passed to all lifecycle methods
export interface ZoneContext {
  zoneId: string;
  dashboardId: string;
  parameters: Record<string, any>;
  filters: Array<{ field: string; operator: string; value: any }>;
  theme: 'light' | 'dark';
  locale: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Data request options
export interface DataRequestOptions {
  refresh?: boolean;
  cache?: boolean;
  timeout?: number;
  limit?: number;
  offset?: number;
}

// Zone data response
export interface ZoneDataResponse<T = any> {
  data: T;
  columns?: Array<{
    name: string;
    type: string;
    nullable: boolean;
  }>;
  rowCount?: number;
  executionTime?: number;
  cached?: boolean;
  timestamp: number;
}

// Zone capability flags
export interface ZoneCapabilities {
  export: boolean;
  refresh: boolean;
  configure: boolean;
  resize: boolean;
  aiInsights: boolean;
  selection: boolean;
  drillDown: boolean;
  annotation: boolean;
}

// Zone configuration
export interface ZoneConfiguration {
  [key: string]: any;
}

// Main Scout Zone Interface
export interface IScoutZone<TData = any, TConfig = ZoneConfiguration> {
  // Metadata
  readonly id: string;
  readonly type: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: ZoneCapabilities;

  // State
  state: ZoneLifecycleState;
  config: TConfig;
  data?: ZoneDataResponse<TData>;
  error?: Error;

  // Lifecycle methods
  onInit(context: ZoneContext): Promise<void>;
  onReady(): Promise<void>;
  onDestroy(): Promise<void>;

  // Data management
  loadData(options?: DataRequestOptions): Promise<ZoneDataResponse<TData>>;
  refreshData(): Promise<ZoneDataResponse<TData>>;
  clearData(): void;

  // Configuration
  configure(config: Partial<TConfig>): Promise<void>;
  validateConfig(config: TConfig): boolean;
  getDefaultConfig(): TConfig;

  // Rendering
  render(): ReactElement;
  renderLoading(): ReactElement;
  renderError(error: Error): ReactElement;
  renderEmpty(): ReactElement;

  // Interactivity
  onSelect?(selection: any): void;
  onHover?(item: any): void;
  onClick?(item: any): void;
  onContextMenu?(item: any, event: MouseEvent): void;

  // Export
  exportData?(format: 'csv' | 'json' | 'excel'): Promise<Blob>;
  exportImage?(format: 'png' | 'svg' | 'pdf'): Promise<Blob>;

  // AI Integration
  getAIContext?(): Record<string, any>;
  handleAIInsight?(insight: any): void;
  explainData?(dataPoint: any): Promise<string>;

  // Events
  emit(event: ScoutEventType | string, data: any): void;
  on(event: ScoutEventType | string, handler: Function): void;
  off(event: ScoutEventType | string, handler: Function): void;
}

// Base implementation class
export abstract class ScoutZoneBase<TData = any, TConfig = ZoneConfiguration> 
  implements IScoutZone<TData, TConfig> {
  
  abstract readonly id: string;
  abstract readonly type: string;
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly capabilities: ZoneCapabilities;

  state: ZoneLifecycleState = ZoneLifecycleState.CREATED;
  config: TConfig;
  data?: ZoneDataResponse<TData>;
  error?: Error;

  protected context?: ZoneContext;
  protected eventHandlers: Map<string, Set<Function>> = new Map();

  constructor(initialConfig?: Partial<TConfig>) {
    this.config = {
      ...this.getDefaultConfig(),
      ...initialConfig
    } as TConfig;
  }

  // Lifecycle implementation
  async onInit(context: ZoneContext): Promise<void> {
    this.state = ZoneLifecycleState.INITIALIZING;
    this.context = context;
    this.emit(ScoutEventType.ZONE_ADDED, { zoneId: this.id });
  }

  async onReady(): Promise<void> {
    this.state = ZoneLifecycleState.READY;
    this.emit('zone:ready', { zoneId: this.id });
  }

  async onDestroy(): Promise<void> {
    this.state = ZoneLifecycleState.DESTROYED;
    this.clearData();
    this.eventHandlers.clear();
    this.emit(ScoutEventType.ZONE_REMOVED, { zoneId: this.id });
  }

  // Data management
  abstract loadData(options?: DataRequestOptions): Promise<ZoneDataResponse<TData>>;

  async refreshData(): Promise<ZoneDataResponse<TData>> {
    this.emit(ScoutEventType.DATA_REQUESTED, { zoneId: this.id });
    try {
      this.state = ZoneLifecycleState.LOADING;
      const response = await this.loadData({ refresh: true });
      this.data = response;
      this.state = ZoneLifecycleState.READY;
      this.emit(ScoutEventType.DATA_RECEIVED, { zoneId: this.id, data: response });
      return response;
    } catch (error) {
      this.error = error as Error;
      this.state = ZoneLifecycleState.ERROR;
      this.emit(ScoutEventType.DATA_ERROR, { zoneId: this.id, error });
      throw error;
    }
  }

  clearData(): void {
    this.data = undefined;
    this.error = undefined;
  }

  // Configuration
  async configure(config: Partial<TConfig>): Promise<void> {
    const newConfig = { ...this.config, ...config };
    if (this.validateConfig(newConfig)) {
      this.config = newConfig;
      this.emit('zone:configured', { zoneId: this.id, config: newConfig });
      await this.refreshData();
    } else {
      throw new Error('Invalid configuration');
    }
  }

  abstract validateConfig(config: TConfig): boolean;
  abstract getDefaultConfig(): TConfig;

  // Rendering
  abstract render(): ReactElement;
  abstract renderLoading(): ReactElement;
  abstract renderError(error: Error): ReactElement;
  abstract renderEmpty(): ReactElement;

  // Event management
  emit(event: ScoutEventType | string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  on(event: ScoutEventType | string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: ScoutEventType | string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  // Optional methods with default implementations
  getAIContext(): Record<string, any> {
    return {
      zoneId: this.id,
      zoneType: this.type,
      config: this.config,
      dataShape: this.data ? {
        rowCount: this.data.rowCount,
        columns: this.data.columns,
        timestamp: this.data.timestamp
      } : null
    };
  }

  async exportData(format: 'csv' | 'json' | 'excel'): Promise<Blob> {
    if (!this.data) {
      throw new Error('No data to export');
    }

    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(this.data.data, null, 2)], {
          type: 'application/json'
        });
      
      case 'csv':
        // Simple CSV export
        const headers = this.data.columns?.map(c => c.name).join(',') || '';
        const rows = Array.isArray(this.data.data) 
          ? this.data.data.map((row: any) => 
              Object.values(row).join(',')
            ).join('\n')
          : '';
        return new Blob([headers + '\n' + rows], {
          type: 'text/csv'
        });
      
      default:
        throw new Error(`Export format ${format} not supported`);
    }
  }
}

// Helper function to create zone instance
export function createZone<T extends IScoutZone>(
  ZoneClass: new (config?: any) => T,
  config?: any
): T {
  return new ZoneClass(config);
}

// Zone registry for dynamic loading
export class ZoneRegistry {
  private static zones = new Map<string, new (config?: any) => IScoutZone>();

  static register(type: string, ZoneClass: new (config?: any) => IScoutZone): void {
    this.zones.set(type, ZoneClass);
  }

  static create(type: string, config?: any): IScoutZone | null {
    const ZoneClass = this.zones.get(type);
    if (!ZoneClass) {
      console.error(`Zone type "${type}" not registered`);
      return null;
    }
    return new ZoneClass(config);
  }

  static getTypes(): string[] {
    return Array.from(this.zones.keys());
  }
}
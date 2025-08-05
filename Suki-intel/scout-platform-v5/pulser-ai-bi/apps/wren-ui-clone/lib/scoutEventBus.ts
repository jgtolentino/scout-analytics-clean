/**
 * Scout Event Bus - Centralized event management system
 * Provides typed events and middleware support
 */

import { EventEmitter } from 'events';

// Event type definitions
export interface ScoutEvent {
  type: string;
  timestamp: number;
  source: string;
  data: any;
  metadata?: Record<string, any>;
}

// Standard Scout event types
export enum ScoutEventType {
  // Dashboard lifecycle
  DASHBOARD_INIT = 'dashboard:init',
  DASHBOARD_READY = 'dashboard:ready',
  DASHBOARD_ERROR = 'dashboard:error',
  DASHBOARD_DESTROYED = 'dashboard:destroyed',
  
  // Layout events
  LAYOUT_CHANGED = 'layout:changed',
  ZONE_ADDED = 'zone:added',
  ZONE_REMOVED = 'zone:removed',
  ZONE_UPDATED = 'zone:updated',
  ZONE_RESIZED = 'zone:resized',
  ZONE_MOVED = 'zone:moved',
  
  // Data events
  DATA_REQUESTED = 'data:requested',
  DATA_RECEIVED = 'data:received',
  DATA_ERROR = 'data:error',
  DATA_REFRESHED = 'data:refreshed',
  QUERY_EXECUTED = 'query:executed',
  QUERY_FAILED = 'query:failed',
  
  // Filter events
  FILTER_ADDED = 'filter:added',
  FILTER_CHANGED = 'filter:changed',
  FILTER_REMOVED = 'filter:removed',
  FILTER_CLEARED = 'filter:cleared',
  FILTERS_RESET = 'filters:reset',
  
  // Parameter events
  PARAMETER_CHANGED = 'parameter:changed',
  PARAMETER_RESET = 'parameter:reset',
  
  // Selection events
  MARK_SELECTED = 'mark:selected',
  MARKS_CLEARED = 'marks:cleared',
  SELECTION_CHANGED = 'selection:changed',
  
  // AI events
  AI_INSIGHT_REQUESTED = 'ai:insight:requested',
  AI_INSIGHT_GENERATED = 'ai:insight:generated',
  AI_RECOMMENDATION_GENERATED = 'ai:recommendation:generated',
  AI_RECOMMENDATION_ACCEPTED = 'ai:recommendation:accepted',
  AI_RECOMMENDATION_REJECTED = 'ai:recommendation:rejected',
  AI_EXPLAIN_REQUESTED = 'ai:explain:requested',
  AI_EXPLAIN_GENERATED = 'ai:explain:generated',
  
  // UI events
  MODAL_OPENED = 'ui:modal:opened',
  MODAL_CLOSED = 'ui:modal:closed',
  DIALOG_OPENED = 'ui:dialog:opened',
  DIALOG_CLOSED = 'ui:dialog:closed',
  TOAST_SHOWN = 'ui:toast:shown',
  
  // User interaction events
  USER_ACTION = 'user:action',
  USER_HOVER = 'user:hover',
  USER_CLICK = 'user:click',
  USER_CONTEXT_MENU = 'user:contextmenu',
  
  // Export events
  EXPORT_STARTED = 'export:started',
  EXPORT_COMPLETED = 'export:completed',
  EXPORT_FAILED = 'export:failed',
  
  // Configuration events
  CONFIG_CHANGED = 'config:changed',
  CONFIG_SAVED = 'config:saved',
  CONFIG_LOADED = 'config:loaded',
  SETTINGS_CHANGED = 'settings:changed'
}

// Event middleware type
type EventMiddleware = (event: ScoutEvent, next: () => void) => void;

// Event handler type
type EventHandler<T = any> = (data: T, event: ScoutEvent) => void;

// Scout Event Bus implementation
export class ScoutEventBus extends EventEmitter {
  private static instance: ScoutEventBus;
  private middlewares: EventMiddleware[] = [];
  private eventLog: ScoutEvent[] = [];
  private maxLogSize: number = 1000;
  private recording: boolean = false;

  private constructor() {
    super();
    this.setMaxListeners(100); // Increase for complex dashboards
  }

  static getInstance(): ScoutEventBus {
    if (!ScoutEventBus.instance) {
      ScoutEventBus.instance = new ScoutEventBus();
    }
    return ScoutEventBus.instance;
  }

  // Emit a typed event
  emitEvent<T = any>(
    type: ScoutEventType | string, 
    data: T, 
    source: string = 'unknown',
    metadata?: Record<string, any>
  ): boolean {
    const event: ScoutEvent = {
      type,
      timestamp: Date.now(),
      source,
      data,
      metadata
    };

    // Log event if recording
    if (this.recording) {
      this.logEvent(event);
    }

    // Process through middleware
    this.processMiddleware(event, () => {
      // Emit to listeners
      this.emit(type, data, event);
      this.emit('*', event); // Wildcard listeners
    });

    return true;
  }

  // Subscribe to typed events
  onEvent<T = any>(
    type: ScoutEventType | string, 
    handler: EventHandler<T>
  ): void {
    this.on(type, handler);
  }

  // Subscribe once to typed events
  onceEvent<T = any>(
    type: ScoutEventType | string, 
    handler: EventHandler<T>
  ): void {
    this.once(type, handler);
  }

  // Unsubscribe from events
  offEvent<T = any>(
    type: ScoutEventType | string, 
    handler: EventHandler<T>
  ): void {
    this.off(type, handler);
  }

  // Add middleware
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  // Process middleware chain
  private processMiddleware(event: ScoutEvent, done: () => void): void {
    let index = 0;

    const next = () => {
      if (index >= this.middlewares.length) {
        done();
        return;
      }

      const middleware = this.middlewares[index++];
      middleware(event, next);
    };

    next();
  }

  // Event logging
  private logEvent(event: ScoutEvent): void {
    this.eventLog.push(event);
    
    // Trim log if too large
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }
  }

  // Start recording events
  startRecording(): void {
    this.recording = true;
    this.eventLog = [];
  }

  // Stop recording events
  stopRecording(): ScoutEvent[] {
    this.recording = false;
    return [...this.eventLog];
  }

  // Get event log
  getEventLog(filter?: (event: ScoutEvent) => boolean): ScoutEvent[] {
    if (filter) {
      return this.eventLog.filter(filter);
    }
    return [...this.eventLog];
  }

  // Clear event log
  clearEventLog(): void {
    this.eventLog = [];
  }

  // Replay events
  replayEvents(events: ScoutEvent[]): void {
    events.forEach(event => {
      this.emit(event.type, event.data, event);
    });
  }

  // Get all listeners for debugging
  getListeners(type?: string): string[] {
    if (type) {
      return this.eventNames()
        .filter(name => name === type)
        .map(name => String(name));
    }
    return this.eventNames().map(name => String(name));
  }

  // Create a scoped emitter for components
  createScope(source: string): ScopedEventBus {
    return new ScopedEventBus(this, source);
  }
}

// Scoped event bus for components
export class ScopedEventBus {
  constructor(
    private bus: ScoutEventBus,
    private source: string
  ) {}

  emit<T = any>(
    type: ScoutEventType | string, 
    data: T, 
    metadata?: Record<string, any>
  ): boolean {
    return this.bus.emitEvent(type, data, this.source, metadata);
  }

  on<T = any>(
    type: ScoutEventType | string, 
    handler: EventHandler<T>
  ): void {
    this.bus.onEvent(type, handler);
  }

  once<T = any>(
    type: ScoutEventType | string, 
    handler: EventHandler<T>
  ): void {
    this.bus.onceEvent(type, handler);
  }

  off<T = any>(
    type: ScoutEventType | string, 
    handler: EventHandler<T>
  ): void {
    this.bus.offEvent(type, handler);
  }
}

// Export singleton instance
export const eventBus = ScoutEventBus.getInstance();

// Helper functions for common patterns
export const createEventLogger = (prefix: string) => {
  return (event: ScoutEvent) => {
    console.log(`[${prefix}] ${event.type}:`, event.data);
  };
};

export const createEventFilter = (types: ScoutEventType[]) => {
  return (event: ScoutEvent) => types.includes(event.type as ScoutEventType);
};

// Middleware examples
export const loggingMiddleware: EventMiddleware = (event, next) => {
  console.log(`[Event] ${event.type} from ${event.source}`, event.data);
  next();
};

export const performanceMiddleware: EventMiddleware = (event, next) => {
  const start = performance.now();
  next();
  const duration = performance.now() - start;
  if (duration > 16) { // Log slow events (> 1 frame)
    console.warn(`[Performance] Event ${event.type} took ${duration.toFixed(2)}ms`);
  }
};

export const analyticsMiddleware: EventMiddleware = (event, next) => {
  // Send to analytics service
  if (event.type.startsWith('user:') || event.type.startsWith('ai:')) {
    // Track user interactions and AI usage
    console.log('[Analytics]', event);
  }
  next();
};
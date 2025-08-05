/**
 * Scout Event System
 * Enhanced event handling with typed events and middleware
 */

export enum ScoutEventType {
  // Core events matching Tableau
  FILTER_CHANGED = 'filter-changed',
  PARAMETER_CHANGED = 'parameter-changed',
  SELECTION_CHANGED = 'selection-changed',
  SETTINGS_CHANGED = 'settings-changed',
  LAYOUT_CHANGED = 'layout-changed',
  
  // Scout enhancements
  AI_INSIGHT_GENERATED = 'ai-insight-generated',
  DATA_REFRESHED = 'data-refreshed',
  ZONE_ADDED = 'zone-added',
  ZONE_REMOVED = 'zone-removed',
  ZONE_UPDATED = 'zone-updated',
  THEME_CHANGED = 'theme-changed',
  USER_ACTION = 'user-action',
  ERROR_OCCURRED = 'error-occurred',
  COLLABORATION_EVENT = 'collaboration-event',
  EXPORT_REQUESTED = 'export-requested',
  DRILL_DOWN = 'drill-down',
  CONTEXT_MENU_OPENED = 'context-menu-opened'
}

export interface ScoutEvent<T = any> {
  type: ScoutEventType | string;
  timestamp: number;
  source: string;
  data: T;
  metadata?: Record<string, any>;
}

export interface FilterChangedEvent {
  worksheetName: string;
  fieldName: string;
  filterType: string;
  appliedValues: any[];
}

export interface ParameterChangedEvent {
  parameterId: string;
  parameterName: string;
  oldValue: any;
  newValue: any;
}

export interface SelectionChangedEvent {
  worksheetName: string;
  selectedMarks: any[];
  deselectedMarks: any[];
}

export interface AIInsightEvent {
  zoneId: number | string;
  insightType: 'anomaly' | 'trend' | 'forecast' | 'recommendation';
  insight: {
    title: string;
    description: string;
    confidence: number;
    actions?: Array<{
      label: string;
      action: string;
    }>;
  };
}

export interface DataRefreshEvent {
  zoneId: number | string;
  dataSource: string;
  rowsUpdated: number;
  success: boolean;
  error?: string;
}

export interface DrillDownEvent {
  zoneId: number | string;
  fromLevel: string;
  toLevel: string;
  filters: Record<string, any>;
  dataPoint: any;
}

export type EventMiddleware = (
  event: ScoutEvent,
  next: () => void
) => void | Promise<void>;

/**
 * Enhanced event bus with middleware support
 */
export class ScoutEventBus {
  private _listeners: Map<string, Set<Function>> = new Map();
  private _middleware: EventMiddleware[] = [];
  private _eventHistory: ScoutEvent[] = [];
  private _recording = false;
  private _maxHistorySize = 1000;

  /**
   * Add middleware for event processing
   */
  use(middleware: EventMiddleware): void {
    this._middleware.push(middleware);
  }

  /**
   * Emit an event through the middleware chain
   */
  emit<T = any>(
    type: ScoutEventType | string,
    data: T,
    source: string = 'unknown',
    metadata?: Record<string, any>
  ): void {
    const event: ScoutEvent<T> = {
      type,
      timestamp: Date.now(),
      source,
      data,
      metadata
    };

    // Add to history if recording
    if (this._recording) {
      this._eventHistory.push(event);
      if (this._eventHistory.length > this._maxHistorySize) {
        this._eventHistory.shift();
      }
    }

    // Process through middleware
    let index = 0;
    const next = () => {
      if (index < this._middleware.length) {
        const middleware = this._middleware[index++];
        middleware(event, next);
      } else {
        // Emit to listeners after middleware
        this._emitToListeners(event);
      }
    };

    next();
  }

  /**
   * Subscribe to events
   */
  on(type: string, handler: Function): void {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    this._listeners.get(type)!.add(handler);
  }

  /**
   * Unsubscribe from events
   */
  off(type: string, handler: Function): void {
    const handlers = this._listeners.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Subscribe to an event once
   */
  once(type: string, handler: Function): void {
    const wrappedHandler = (...args: any[]) => {
      handler(...args);
      this.off(type, wrappedHandler);
    };
    this.on(type, wrappedHandler);
  }

  /**
   * Start recording events
   */
  startRecording(): void {
    this._recording = true;
    this._eventHistory = [];
  }

  /**
   * Stop recording and return events
   */
  stopRecording(): ScoutEvent[] {
    this._recording = false;
    return [...this._eventHistory];
  }

  /**
   * Replay recorded events
   */
  replayEvents(events: ScoutEvent[], speed: number = 1): void {
    let index = 0;
    
    const replayNext = () => {
      if (index < events.length) {
        const event = events[index++];
        this._emitToListeners(event);
        
        if (index < events.length) {
          const nextEvent = events[index];
          const delay = (nextEvent.timestamp - event.timestamp) / speed;
          setTimeout(replayNext, delay);
        }
      }
    };
    
    replayNext();
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this._listeners.clear();
  }

  /**
   * Get event statistics
   */
  getStats(): {
    totalEvents: number;
    eventTypes: Record<string, number>;
    recentEvents: ScoutEvent[];
  } {
    const eventTypes: Record<string, number> = {};
    
    this._eventHistory.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });
    
    return {
      totalEvents: this._eventHistory.length,
      eventTypes,
      recentEvents: this._eventHistory.slice(-10)
    };
  }

  private _emitToListeners(event: ScoutEvent): void {
    const handlers = this._listeners.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
          
          // Emit error event
          if (event.type !== ScoutEventType.ERROR_OCCURRED) {
            this.emit(ScoutEventType.ERROR_OCCURRED, {
              originalEvent: event,
              error: error
            }, 'event-bus');
          }
        }
      });
    }
    
    // Also emit to wildcard listeners
    const wildcardHandlers = this._listeners.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in wildcard event handler:', error);
        }
      });
    }
  }
}

// Create global event bus instance
let globalEventBus: ScoutEventBus | null = null;

export function getGlobalEventBus(): ScoutEventBus {
  if (!globalEventBus) {
    globalEventBus = new ScoutEventBus();
    
    // Add default middleware
    globalEventBus.use(loggingMiddleware);
    globalEventBus.use(performanceMiddleware);
    
    // Make available globally
    if (typeof window !== 'undefined') {
      (window as any).scoutEventBus = globalEventBus;
    }
  }
  
  return globalEventBus;
}

// Default middleware

export const loggingMiddleware: EventMiddleware = (event, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Scout Event] ${event.type}`, {
      source: event.source,
      data: event.data,
      timestamp: new Date(event.timestamp).toISOString()
    });
  }
  next();
};

export const performanceMiddleware: EventMiddleware = (event, next) => {
  const start = performance.now();
  next();
  const duration = performance.now() - start;
  
  if (duration > 100) {
    console.warn(`Slow event processing for ${event.type}: ${duration.toFixed(2)}ms`);
  }
};

export const analyticsMiddleware: EventMiddleware = (event, next) => {
  // Send to analytics service
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Scout Event', {
      type: event.type,
      source: event.source,
      metadata: event.metadata
    });
  }
  next();
};
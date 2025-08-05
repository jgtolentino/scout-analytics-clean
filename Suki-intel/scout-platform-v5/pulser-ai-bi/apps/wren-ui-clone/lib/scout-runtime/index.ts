/**
 * Scout Runtime - Complete Tableau Extensions API Parity Implementation
 * 
 * This provides a drop-in replacement for tableau.extensions with enhanced capabilities
 */

import { EventEmitter } from 'events';
import { 
  DashboardContent,
  Environment,
  Settings,
  UI,
  ScoutWorkbook,
  ScoutExtensions,
  ContextMenuCallbacks,
  VizImageInputSpec
} from './types';
import { DashboardContentImpl } from './dashboard-content';
import { EnvironmentImpl } from './environment';
import { SettingsImpl } from './settings';
import { UIImpl } from './ui';
import { WorkbookImpl } from './workbook';

/**
 * Main Scout Extensions implementation matching Tableau's API
 */
class ScoutExtensionsImpl extends EventEmitter implements ScoutExtensions {
  private _dashboardContent?: DashboardContent;
  private _environment: Environment;
  private _settings: Settings;
  private _ui: UI;
  private _workbook?: ScoutWorkbook;
  private _dashboardObjectId?: number;
  private _initialized = false;
  private _contextMenuCallbacks?: ContextMenuCallbacks;

  constructor() {
    super();
    this._environment = new EnvironmentImpl();
    this._settings = new SettingsImpl();
    this._ui = new UIImpl();
  }

  /**
   * Initialize the extension - mirrors tableau.extensions.initializeAsync()
   */
  async initializeAsync(contextMenuCallbacks?: ContextMenuCallbacks): Promise<void> {
    if (this._initialized) {
      throw new Error('Extension already initialized');
    }

    this._contextMenuCallbacks = contextMenuCallbacks;
    
    // Initialize environment
    await this._environment.initialize();
    
    // Initialize dashboard content if in dashboard context
    if (this.isDashboardExtension()) {
      this._dashboardContent = new DashboardContentImpl();
      await this._dashboardContent.initialize();
      this._dashboardObjectId = await this.getDashboardObjectId();
    }
    
    // Initialize workbook
    this._workbook = new WorkbookImpl();
    await this._workbook.initialize();
    
    // Register context menu handlers
    if (contextMenuCallbacks) {
      this.registerContextMenuHandlers(contextMenuCallbacks);
    }
    
    this._initialized = true;
    this.emit('initialized');
  }

  /**
   * Initialize dialog extension - mirrors tableau.extensions.initializeDialogAsync()
   */
  async initializeDialogAsync(): Promise<string> {
    if (this._initialized) {
      throw new Error('Dialog already initialized');
    }

    // Get payload from parent window
    const payload = await this.getDialogPayload();
    
    // Initialize minimal environment for dialog
    await this._environment.initialize();
    this._initialized = true;
    
    return payload;
  }

  /**
   * Get dashboard content namespace
   */
  get dashboardContent(): DashboardContent | undefined {
    if (!this._initialized) {
      throw new Error('Extension not initialized. Call initializeAsync() first.');
    }
    return this._dashboardContent;
  }

  /**
   * Get environment namespace
   */
  get environment(): Environment {
    return this._environment;
  }

  /**
   * Get settings namespace
   */
  get settings(): Settings {
    if (!this._initialized) {
      throw new Error('Extension not initialized. Call initializeAsync() first.');
    }
    return this._settings;
  }

  /**
   * Get UI namespace
   */
  get ui(): UI {
    if (!this._initialized) {
      throw new Error('Extension not initialized. Call initializeAsync() first.');
    }
    return this._ui;
  }

  /**
   * Get workbook
   */
  get workbook(): ScoutWorkbook | undefined {
    if (!this._initialized) {
      throw new Error('Extension not initialized. Call initializeAsync() first.');
    }
    return this._workbook;
  }

  /**
   * Get dashboard object ID
   */
  get dashboardObjectId(): number | undefined {
    return this._dashboardObjectId;
  }

  /**
   * Create viz image from spec - enhanced with AI insights
   */
  async createVizImageAsync(inputSpec: VizImageInputSpec): Promise<string> {
    if (!this._initialized) {
      throw new Error('Extension not initialized. Call initializeAsync() first.');
    }

    // Import viz renderer dynamically
    const { renderVizToSvg } = await import('./viz-renderer');
    
    // Render visualization
    const svg = await renderVizToSvg(inputSpec);
    
    // Emit event for analytics
    this.emit('vizCreated', { spec: inputSpec, svg });
    
    return svg;
  }

  /**
   * Set click-through behavior for server extensions
   */
  async setClickThroughAsync(clickThroughEnabled: boolean): Promise<void> {
    if (!this._initialized) {
      throw new Error('Extension not initialized. Call initializeAsync() first.');
    }

    if (this._environment.mode === 'authoring') {
      throw new Error('setClickThroughAsync is not supported in authoring mode');
    }

    // Apply click-through CSS
    const extensionFrame = document.body;
    if (clickThroughEnabled) {
      extensionFrame.style.pointerEvents = 'none';
      // Allow specific interactive elements
      const interactiveElements = extensionFrame.querySelectorAll('button, input, select, a');
      interactiveElements.forEach(el => {
        (el as HTMLElement).style.pointerEvents = 'auto';
      });
    } else {
      extensionFrame.style.pointerEvents = 'auto';
    }

    this.emit('clickThroughChanged', clickThroughEnabled);
  }

  // Enhanced Scout methods beyond Tableau

  /**
   * Request AI insight for current context
   */
  async requestAIInsight(context: any): Promise<any> {
    if (!this._initialized) {
      throw new Error('Extension not initialized. Call initializeAsync() first.');
    }

    const { generateAIInsight } = await import('./ai-insights');
    const insight = await generateAIInsight(context);
    
    this.emit('aiInsightGenerated', insight);
    return insight;
  }

  /**
   * Export dashboard as various formats
   */
  async exportDashboard(format: 'pdf' | 'png' | 'xlsx' | 'pptx'): Promise<Blob> {
    if (!this._dashboardContent) {
      throw new Error('Export only available for dashboard extensions');
    }

    const { exportDashboard } = await import('./export');
    return exportDashboard(this._dashboardContent, format);
  }

  /**
   * Enable real-time collaboration
   */
  async enableCollaboration(options?: any): Promise<void> {
    const { initializeCollaboration } = await import('./collaboration');
    await initializeCollaboration(this, options);
    this.emit('collaborationEnabled');
  }

  // Private helper methods

  private isDashboardExtension(): boolean {
    // Check if running in dashboard context
    return window.location.pathname.includes('dashboard') || 
           window.parent !== window;
  }

  private async getDashboardObjectId(): Promise<number> {
    // Get ID from URL params or parent context
    const params = new URLSearchParams(window.location.search);
    const id = params.get('dashboardObjectId');
    return id ? parseInt(id, 10) : Date.now();
  }

  private async getDialogPayload(): Promise<string> {
    // Get payload from parent window message
    return new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        if (event.data.type === 'dialog-payload') {
          window.removeEventListener('message', handler);
          resolve(event.data.payload || '');
        }
      };
      window.addEventListener('message', handler);
      
      // Request payload from parent
      window.parent.postMessage({ type: 'request-dialog-payload' }, '*');
    });
  }

  private registerContextMenuHandlers(callbacks: ContextMenuCallbacks): void {
    // Listen for context menu messages
    window.addEventListener('message', (event) => {
      if (event.data.type === 'context-menu-action') {
        const action = event.data.action;
        const handler = callbacks[action];
        if (handler && typeof handler === 'function') {
          handler();
        }
      }
    });
  }
}

// Create singleton instance
export const scout = new ScoutExtensionsImpl();

// For compatibility with Tableau patterns
export const extensions = scout;

// Export types
export * from './types';
export * from './events';
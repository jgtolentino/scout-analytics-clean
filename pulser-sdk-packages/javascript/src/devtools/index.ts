/**
 * Pulser SDK DevTools Integration
 * Provides browser DevTools logging and debugging capabilities
 */

import { EventEmitter } from 'eventemitter3';

export interface AgentLog {
  id: string;
  agent: string;
  input: any;
  output: any;
  timestamp: string;
  duration?: number;
  mock: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface DevToolsConfig {
  enabled: boolean;
  maxLogs: number;
  persistToLocalStorage: boolean;
  consoleLogging: boolean;
  overlayEnabled: boolean;
}

export class PulserDevTools extends EventEmitter {
  private logs: AgentLog[] = [];
  private config: DevToolsConfig;
  private overlayElement?: HTMLElement;
  private isOverlayVisible: boolean = false;

  constructor(config: Partial<DevToolsConfig> = {}) {
    super();
    this.config = {
      enabled: true,
      maxLogs: 100,
      persistToLocalStorage: true,
      consoleLogging: true,
      overlayEnabled: true,
      ...config
    };

    if (typeof window !== 'undefined') {
      this.initializeDevTools();
    }
  }

  private initializeDevTools() {
    // Load persisted logs
    if (this.config.persistToLocalStorage) {
      this.loadPersistedLogs();
    }

    // Create overlay if enabled
    if (this.config.overlayEnabled) {
      this.createOverlay();
    }

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Expose to window for debugging
    if (process.env.NODE_ENV === 'development') {
      (window as any).__pulserDevTools = this;
    }
  }

  public logAgentCall(log: Omit<AgentLog, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return;

    const fullLog: AgentLog = {
      ...log,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    // Add to memory
    this.logs.unshift(fullLog);
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(0, this.config.maxLogs);
    }

    // Console logging
    if (this.config.consoleLogging) {
      this.logToConsole(fullLog);
    }

    // Persist to localStorage
    if (this.config.persistToLocalStorage) {
      this.persistLogs();
    }

    // Update overlay
    if (this.overlayElement && this.isOverlayVisible) {
      this.updateOverlay();
    }

    // Emit event
    this.emit('log', fullLog);
  }

  private logToConsole(log: AgentLog): void {
    const styles = {
      header: 'color: #9333EA; font-weight: bold; font-size: 12px;',
      mock: 'color: #F59E0B; font-style: italic;',
      real: 'color: #10B981;',
      error: 'color: #EF4444; font-weight: bold;'
    };

    const mockLabel = log.mock ? '[MOCK]' : '[REAL]';
    const mockStyle = log.mock ? styles.mock : styles.real;

    if (log.error) {
      console.error(
        `%c[Pulser Agent Error]%c ${mockLabel} ${log.agent}`,
        styles.error,
        mockStyle,
        {
          error: log.error,
          input: log.input,
          output: log.output,
          duration: log.duration ? `${log.duration}ms` : 'N/A'
        }
      );
    } else {
      console.info(
        `%c[Pulser Agent]%c ${mockLabel} ${log.agent}`,
        styles.header,
        mockStyle,
        {
          input: log.input,
          output: log.output,
          duration: log.duration ? `${log.duration}ms` : 'N/A'
        }
      );
    }
  }

  private createOverlay(): void {
    const overlay = document.createElement('div');
    overlay.id = 'pulser-devtools-overlay';
    overlay.innerHTML = this.getOverlayHTML();
    this.applyOverlayStyles(overlay);
    
    document.body.appendChild(overlay);
    this.overlayElement = overlay;
    
    // Set up overlay event handlers
    this.setupOverlayHandlers();
  }

  private getOverlayHTML(): string {
    return `
      <div class="pulser-overlay-header">
        <h3>Pulser DevTools</h3>
        <div class="pulser-overlay-controls">
          <button id="pulser-clear-logs">Clear</button>
          <button id="pulser-export-logs">Export</button>
          <button id="pulser-close-overlay">×</button>
        </div>
      </div>
      <div class="pulser-overlay-filters">
        <input type="text" id="pulser-filter-input" placeholder="Filter logs..." />
        <label>
          <input type="checkbox" id="pulser-show-mock" checked /> Show Mock
        </label>
        <label>
          <input type="checkbox" id="pulser-show-real" checked /> Show Real
        </label>
      </div>
      <div id="pulser-overlay-logs" class="pulser-overlay-logs"></div>
    `;
  }

  private applyOverlayStyles(overlay: HTMLElement): void {
    overlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 500px;
      max-height: 600px;
      background: #1F2937;
      color: #F3F4F6;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      z-index: 999999;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      display: ${this.isOverlayVisible ? 'block' : 'none'};
    `;

    const style = document.createElement('style');
    style.textContent = `
      .pulser-overlay-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #111827;
        border-radius: 8px 8px 0 0;
      }
      .pulser-overlay-header h3 {
        margin: 0;
        color: #9333EA;
        font-size: 14px;
      }
      .pulser-overlay-controls button {
        background: #374151;
        color: #F3F4F6;
        border: none;
        padding: 4px 8px;
        margin-left: 8px;
        border-radius: 4px;
        cursor: pointer;
      }
      .pulser-overlay-controls button:hover {
        background: #4B5563;
      }
      .pulser-overlay-filters {
        padding: 8px 16px;
        background: #1F2937;
        border-bottom: 1px solid #374151;
      }
      .pulser-overlay-filters input[type="text"] {
        width: 100%;
        padding: 4px 8px;
        background: #374151;
        border: 1px solid #4B5563;
        color: #F3F4F6;
        border-radius: 4px;
        margin-bottom: 8px;
      }
      .pulser-overlay-filters label {
        margin-right: 16px;
        font-size: 11px;
      }
      .pulser-overlay-logs {
        max-height: 450px;
        overflow-y: auto;
        padding: 8px;
      }
      .pulser-log-entry {
        background: #374151;
        margin-bottom: 8px;
        padding: 8px;
        border-radius: 4px;
        border-left: 3px solid #9333EA;
      }
      .pulser-log-entry.mock {
        border-left-color: #F59E0B;
      }
      .pulser-log-entry.error {
        border-left-color: #EF4444;
      }
      .pulser-log-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .pulser-log-agent {
        font-weight: bold;
        color: #9333EA;
      }
      .pulser-log-time {
        color: #9CA3AF;
        font-size: 10px;
      }
      .pulser-log-content {
        font-size: 11px;
        color: #D1D5DB;
      }
      .pulser-log-json {
        background: #1F2937;
        padding: 4px;
        border-radius: 2px;
        margin-top: 4px;
        overflow-x: auto;
      }
    `;
    document.head.appendChild(style);
  }

  private setupOverlayHandlers(): void {
    if (!this.overlayElement) return;

    // Close button
    this.overlayElement.querySelector('#pulser-close-overlay')?.addEventListener('click', () => {
      this.toggleOverlay();
    });

    // Clear logs
    this.overlayElement.querySelector('#pulser-clear-logs')?.addEventListener('click', () => {
      this.clearLogs();
    });

    // Export logs
    this.overlayElement.querySelector('#pulser-export-logs')?.addEventListener('click', () => {
      this.exportLogs();
    });

    // Filter handlers
    const filterInput = this.overlayElement.querySelector('#pulser-filter-input') as HTMLInputElement;
    const showMock = this.overlayElement.querySelector('#pulser-show-mock') as HTMLInputElement;
    const showReal = this.overlayElement.querySelector('#pulser-show-real') as HTMLInputElement;

    const updateFilters = () => this.updateOverlay();
    filterInput?.addEventListener('input', updateFilters);
    showMock?.addEventListener('change', updateFilters);
    showReal?.addEventListener('change', updateFilters);
  }

  private updateOverlay(): void {
    if (!this.overlayElement) return;

    const logsContainer = this.overlayElement.querySelector('#pulser-overlay-logs');
    if (!logsContainer) return;

    const filterInput = this.overlayElement.querySelector('#pulser-filter-input') as HTMLInputElement;
    const showMock = this.overlayElement.querySelector('#pulser-show-mock') as HTMLInputElement;
    const showReal = this.overlayElement.querySelector('#pulser-show-real') as HTMLInputElement;

    const filter = filterInput?.value.toLowerCase() || '';
    const shouldShowMock = showMock?.checked ?? true;
    const shouldShowReal = showReal?.checked ?? true;

    const filteredLogs = this.logs.filter(log => {
      // Type filter
      if (log.mock && !shouldShowMock) return false;
      if (!log.mock && !shouldShowReal) return false;

      // Text filter
      if (filter) {
        const searchText = `${log.agent} ${JSON.stringify(log.input)} ${JSON.stringify(log.output)}`.toLowerCase();
        if (!searchText.includes(filter)) return false;
      }

      return true;
    });

    logsContainer.innerHTML = filteredLogs.map(log => `
      <div class="pulser-log-entry ${log.mock ? 'mock' : 'real'} ${log.error ? 'error' : ''}">
        <div class="pulser-log-header">
          <span class="pulser-log-agent">${log.agent}</span>
          <span class="pulser-log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="pulser-log-content">
          ${log.error ? `<div style="color: #EF4444;">Error: ${log.error}</div>` : ''}
          <div class="pulser-log-json">
            <div>Input: ${JSON.stringify(log.input, null, 2)}</div>
            <div>Output: ${JSON.stringify(log.output, null, 2)}</div>
            ${log.duration ? `<div>Duration: ${log.duration}ms</div>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + P to toggle overlay
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.toggleOverlay();
      }
    });
  }

  public toggleOverlay(): void {
    if (!this.overlayElement) return;
    
    this.isOverlayVisible = !this.isOverlayVisible;
    this.overlayElement.style.display = this.isOverlayVisible ? 'block' : 'none';
    
    if (this.isOverlayVisible) {
      this.updateOverlay();
    }
  }

  public clearLogs(): void {
    this.logs = [];
    this.persistLogs();
    this.updateOverlay();
    this.emit('clear');
  }

  public exportLogs(): void {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulser-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    this.emit('export', this.logs);
  }

  public getAgentLogs(): AgentLog[] {
    return [...this.logs];
  }

  private loadPersistedLogs(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    try {
      const stored = localStorage.getItem('pulserAgentLogs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load persisted logs:', error);
    }
  }

  private persistLogs(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    try {
      localStorage.setItem('pulserAgentLogs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  private generateId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
/**
 * Collaboration Module
 * Enables real-time collaboration features
 */

import { ScoutExtensions } from './types';
import { getGlobalEventBus, ScoutEventType } from './events';

export interface CollaborationOptions {
  sessionId?: string;
  userId?: string;
  userName?: string;
  role?: 'viewer' | 'editor' | 'admin';
  realtimeProvider?: 'websocket' | 'webrtc' | 'polling';
}

export interface CollaboratorInfo {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: any;
  lastActive: Date;
}

export interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'change' | 'chat' | 'annotation';
  userId: string;
  data: any;
  timestamp: Date;
}

class CollaborationManager {
  private extensions: ScoutExtensions;
  private options: CollaborationOptions;
  private collaborators: Map<string, CollaboratorInfo> = new Map();
  private eventBus = getGlobalEventBus();
  private ws?: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  constructor(extensions: ScoutExtensions, options: CollaborationOptions) {
    this.extensions = extensions;
    this.options = {
      sessionId: options.sessionId || generateSessionId(),
      userId: options.userId || generateUserId(),
      userName: options.userName || 'Anonymous User',
      role: options.role || 'viewer',
      realtimeProvider: options.realtimeProvider || 'websocket'
    };
  }

  async initialize(): Promise<void> {
    switch (this.options.realtimeProvider) {
      case 'websocket':
        await this.initializeWebSocket();
        break;
      case 'webrtc':
        await this.initializeWebRTC();
        break;
      case 'polling':
        await this.initializePolling();
        break;
    }
    
    // Set up local event listeners
    this.setupEventListeners();
    
    // Announce presence
    this.broadcastPresence();
  }

  private async initializeWebSocket(): Promise<void> {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    
    this.ws = new WebSocket(`${wsUrl}/collaboration/${this.options.sessionId}`);
    
    this.ws.onopen = () => {
      console.log('Collaboration websocket connected');
      this.reconnectAttempts = 0;
      this.broadcastPresence();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleCollaborationMessage(message);
      } catch (error) {
        console.error('Error parsing collaboration message:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('Collaboration websocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('Collaboration websocket closed');
      this.attemptReconnect();
    };
  }

  private async initializeWebRTC(): Promise<void> {
    // WebRTC implementation for peer-to-peer collaboration
    console.log('WebRTC collaboration not yet implemented');
  }

  private async initializePolling(): Promise<void> {
    // Polling-based collaboration for environments without WebSocket support
    const pollInterval = 2000; // 2 seconds
    
    setInterval(async () => {
      try {
        const response = await fetch(`/api/collaboration/${this.options.sessionId}/events`, {
          headers: {
            'X-User-Id': this.options.userId!,
            'X-Last-Event': this.getLastEventTimestamp()
          }
        });
        
        if (response.ok) {
          const events = await response.json();
          events.forEach((event: any) => this.handleCollaborationMessage(event));
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, pollInterval);
  }

  private setupEventListeners(): void {
    // Track cursor movements
    document.addEventListener('mousemove', this.throttle((e: MouseEvent) => {
      this.broadcast({
        type: 'cursor',
        userId: this.options.userId!,
        data: { x: e.clientX, y: e.clientY },
        timestamp: new Date()
      });
    }, 50));
    
    // Track selections
    this.eventBus.on(ScoutEventType.SELECTION_CHANGED, (event: any) => {
      this.broadcast({
        type: 'selection',
        userId: this.options.userId!,
        data: event.data,
        timestamp: new Date()
      });
    });
    
    // Track parameter changes
    this.eventBus.on(ScoutEventType.PARAMETER_CHANGED, (event: any) => {
      if (this.options.role !== 'viewer') {
        this.broadcast({
          type: 'change',
          userId: this.options.userId!,
          data: { type: 'parameter', ...event.data },
          timestamp: new Date()
        });
      }
    });
    
    // Track filter changes
    this.eventBus.on(ScoutEventType.FILTER_CHANGED, (event: any) => {
      if (this.options.role !== 'viewer') {
        this.broadcast({
          type: 'change',
          userId: this.options.userId!,
          data: { type: 'filter', ...event.data },
          timestamp: new Date()
        });
      }
    });
  }

  private broadcastPresence(): void {
    const userInfo: CollaboratorInfo = {
      id: this.options.userId!,
      name: this.options.userName!,
      color: this.generateUserColor(this.options.userId!),
      lastActive: new Date()
    };
    
    this.broadcast({
      type: 'presence',
      userId: this.options.userId!,
      data: userInfo,
      timestamp: new Date()
    } as any);
  }

  private broadcast(event: CollaborationEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else if (this.options.realtimeProvider === 'polling') {
      // Queue for next poll
      fetch(`/api/collaboration/${this.options.sessionId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.options.userId!
        },
        body: JSON.stringify(event)
      }).catch(console.error);
    }
  }

  private handleCollaborationMessage(message: any): void {
    // Ignore own messages
    if (message.userId === this.options.userId) return;
    
    switch (message.type) {
      case 'presence':
        this.updateCollaborator(message.data);
        break;
        
      case 'cursor':
        this.updateCollaboratorCursor(message.userId, message.data);
        break;
        
      case 'selection':
        this.updateCollaboratorSelection(message.userId, message.data);
        break;
        
      case 'change':
        this.applyRemoteChange(message.data);
        break;
        
      case 'chat':
        this.handleChatMessage(message);
        break;
        
      case 'annotation':
        this.handleAnnotation(message);
        break;
    }
    
    // Emit collaboration event
    this.eventBus.emit(ScoutEventType.COLLABORATION_EVENT, message, 'collaboration');
  }

  private updateCollaborator(info: CollaboratorInfo): void {
    this.collaborators.set(info.id, info);
    this.renderCollaborators();
  }

  private updateCollaboratorCursor(userId: string, cursor: { x: number; y: number }): void {
    const collaborator = this.collaborators.get(userId);
    if (collaborator) {
      collaborator.cursor = cursor;
      collaborator.lastActive = new Date();
      this.renderCollaboratorCursor(collaborator);
    }
  }

  private updateCollaboratorSelection(userId: string, selection: any): void {
    const collaborator = this.collaborators.get(userId);
    if (collaborator) {
      collaborator.selection = selection;
      collaborator.lastActive = new Date();
      this.renderCollaboratorSelection(collaborator);
    }
  }

  private applyRemoteChange(change: any): void {
    // Apply changes from other collaborators
    switch (change.type) {
      case 'parameter':
        // Update parameter without triggering broadcast
        this.extensions.settings.set(`param_${change.parameterId}`, change.newValue);
        break;
        
      case 'filter':
        // Update filter without triggering broadcast
        console.log('Remote filter change:', change);
        break;
    }
  }

  private handleChatMessage(message: any): void {
    // Display chat message in UI
    this.extensions.ui.showToast({
      message: `${message.userName}: ${message.data.text}`,
      type: 'info',
      duration: 5000
    });
  }

  private handleAnnotation(message: any): void {
    // Add annotation to dashboard
    const annotation = message.data;
    this.renderAnnotation(annotation);
  }

  private renderCollaborators(): void {
    // Update collaborator list UI
    const container = document.querySelector('.scout-collaborators');
    if (!container) return;
    
    container.innerHTML = Array.from(this.collaborators.values())
      .map(c => `
        <div class="collaborator" style="--user-color: ${c.color}">
          <span class="avatar">${c.name.charAt(0).toUpperCase()}</span>
          <span class="name">${c.name}</span>
        </div>
      `).join('');
  }

  private renderCollaboratorCursor(collaborator: CollaboratorInfo): void {
    let cursor = document.querySelector(`#cursor-${collaborator.id}`);
    
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = `cursor-${collaborator.id}`;
      cursor.className = 'collaborator-cursor';
      cursor.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path d="M0 0 L0 16 L4 12 L7 19 L9 18 L6 11 L12 11 Z" 
                fill="${collaborator.color}" 
                stroke="white" 
                stroke-width="1"/>
        </svg>
        <span class="cursor-label">${collaborator.name}</span>
      `;
      document.body.appendChild(cursor);
    }
    
    if (collaborator.cursor) {
      (cursor as HTMLElement).style.transform = 
        `translate(${collaborator.cursor.x}px, ${collaborator.cursor.y}px)`;
    }
  }

  private renderCollaboratorSelection(collaborator: CollaboratorInfo): void {
    // Highlight selected elements with collaborator's color
    const elements = document.querySelectorAll('.collaborator-selection');
    elements.forEach(el => {
      if (el.getAttribute('data-user-id') === collaborator.id) {
        el.remove();
      }
    });
    
    if (collaborator.selection) {
      // Add selection highlight
      const highlight = document.createElement('div');
      highlight.className = 'collaborator-selection';
      highlight.setAttribute('data-user-id', collaborator.id);
      highlight.style.borderColor = collaborator.color;
      // Position based on selection
      document.body.appendChild(highlight);
    }
  }

  private renderAnnotation(annotation: any): void {
    const annotationEl = document.createElement('div');
    annotationEl.className = 'scout-annotation';
    annotationEl.innerHTML = `
      <div class="annotation-header">
        <span class="author">${annotation.author}</span>
        <span class="timestamp">${new Date(annotation.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="annotation-content">${annotation.text}</div>
    `;
    annotationEl.style.left = `${annotation.x}px`;
    annotationEl.style.top = `${annotation.y}px`;
    
    document.body.appendChild(annotationEl);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.initializeWebSocket();
    }, delay);
  }

  private throttle(func: Function, wait: number): any {
    let timeout: any;
    let lastTime = 0;
    
    return (...args: any[]) => {
      const now = Date.now();
      const remaining = wait - (now - lastTime);
      
      if (remaining <= 0) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        lastTime = now;
        func(...args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          lastTime = Date.now();
          timeout = null;
          func(...args);
        }, remaining);
      }
    };
  }

  private generateUserColor(userId: string): string {
    // Generate consistent color from user ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  private getLastEventTimestamp(): string {
    // Return timestamp of last received event for polling
    return new Date().toISOString();
  }
}

// Helper functions

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize collaboration
export async function initializeCollaboration(
  extensions: ScoutExtensions,
  options?: CollaborationOptions
): Promise<void> {
  const manager = new CollaborationManager(extensions, options || {});
  await manager.initialize();
  
  // Add collaboration styles
  addCollaborationStyles();
  
  // Store manager for later access
  (window as any).scoutCollaboration = manager;
}

function addCollaborationStyles(): void {
  if (!document.querySelector('#scout-collaboration-styles')) {
    const style = document.createElement('style');
    style.id = 'scout-collaboration-styles';
    style.textContent = `
      .collaborator-cursor {
        position: fixed;
        pointer-events: none;
        z-index: 10003;
        transition: transform 0.1s ease-out;
      }
      
      .cursor-label {
        position: absolute;
        top: 20px;
        left: 10px;
        background: var(--user-color);
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
      }
      
      .collaborator-selection {
        position: absolute;
        border: 2px solid;
        background: transparent;
        pointer-events: none;
        z-index: 9999;
      }
      
      .scout-collaborators {
        position: fixed;
        top: 10px;
        right: 10px;
        display: flex;
        gap: 10px;
        z-index: 10001;
      }
      
      .collaborator {
        display: flex;
        align-items: center;
        gap: 5px;
        background: white;
        padding: 5px 10px;
        border-radius: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .collaborator .avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--user-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      }
      
      .scout-annotation {
        position: absolute;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        padding: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 200px;
      }
      
      .annotation-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 12px;
        color: #6b7280;
      }
      
      .annotation-content {
        font-size: 14px;
        color: #374151;
      }
    `;
    document.head.appendChild(style);
  }
}
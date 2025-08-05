/**
 * UI Implementation
 * Provides methods for displaying dialogs, modals, and toasts
 */

import { UI, DialogOptions, ModalOptions, ToastOptions, ContextMenuOptions } from './types';

export class UIImpl implements UI {
  private _activeDialog?: Window;
  private _dialogPayload?: string;

  async displayDialogAsync(
    url: string,
    payload?: string,
    options?: DialogOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const width = options?.width || 800;
        const height = options?.height || 600;
        const style = options?.style || 'modal';
        
        // Calculate center position
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        // Prepare window features
        const features = [
          `width=${width}`,
          `height=${height}`,
          `left=${left}`,
          `top=${top}`,
          'resizable=yes',
          'scrollbars=yes'
        ];
        
        if (style === 'modal') {
          features.push('modal=yes');
        }
        
        // Store payload for dialog
        this._dialogPayload = payload;
        
        // Open dialog window
        this._activeDialog = window.open(url, 'scout-dialog', features.join(','));
        
        if (!this._activeDialog) {
          throw new Error('Failed to open dialog window');
        }
        
        // Set up message listener for dialog response
        const messageHandler = (event: MessageEvent) => {
          if (event.data.type === 'dialog-response') {
            window.removeEventListener('message', messageHandler);
            resolve(event.data.payload || '');
          }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Handle dialog close
        const checkClosed = setInterval(() => {
          if (this._activeDialog?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            resolve('');
          }
        }, 500);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  closeDialog(payload?: string): void {
    if (window.opener) {
      // Send response to parent window
      window.opener.postMessage({
        type: 'dialog-response',
        payload: payload || ''
      }, '*');
      
      // Close dialog window
      window.close();
    }
  }

  async showModal(options: ModalOptions): Promise<any> {
    return new Promise((resolve) => {
      // Create modal container
      const modalContainer = document.createElement('div');
      modalContainer.className = 'scout-modal-container';
      modalContainer.innerHTML = `
        <div class="scout-modal-overlay"></div>
        <div class="scout-modal scout-modal-${options.size || 'medium'}">
          <div class="scout-modal-header">
            <h2 class="scout-modal-title">${options.title}</h2>
            <button class="scout-modal-close">&times;</button>
          </div>
          <div class="scout-modal-content"></div>
          <div class="scout-modal-footer"></div>
        </div>
      `;
      
      // Add content
      const contentEl = modalContainer.querySelector('.scout-modal-content');
      if (contentEl) {
        if (typeof options.content === 'string') {
          contentEl.innerHTML = options.content;
        } else {
          // For React content, would use ReactDOM.render
          contentEl.appendChild(options.content as any);
        }
      }
      
      // Add actions
      const footerEl = modalContainer.querySelector('.scout-modal-footer');
      if (footerEl && options.actions) {
        options.actions.forEach(action => {
          const button = document.createElement('button');
          button.className = `scout-button scout-button-${action.variant || 'secondary'}`;
          button.textContent = action.label;
          button.onclick = async () => {
            await action.action();
            cleanup();
            resolve(action.label);
          };
          footerEl.appendChild(button);
        });
      }
      
      // Setup close handlers
      const cleanup = () => {
        modalContainer.remove();
      };
      
      const closeButton = modalContainer.querySelector('.scout-modal-close');
      closeButton?.addEventListener('click', () => {
        cleanup();
        resolve(null);
      });
      
      if (options.closeOnOverlayClick !== false) {
        const overlay = modalContainer.querySelector('.scout-modal-overlay');
        overlay?.addEventListener('click', () => {
          cleanup();
          resolve(null);
        });
      }
      
      // Add to DOM
      document.body.appendChild(modalContainer);
      
      // Add styles if not already present
      this._ensureModalStyles();
    });
  }

  showToast(options: ToastOptions): void {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `scout-toast scout-toast-${options.type || 'info'} scout-toast-${options.position || 'top-right'}`;
    toast.textContent = options.message;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Add styles if not already present
    this._ensureToastStyles();
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('scout-toast-visible');
    }, 10);
    
    // Auto remove
    const duration = options.duration || 3000;
    setTimeout(() => {
      toast.classList.remove('scout-toast-visible');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  showContextMenu(options: ContextMenuOptions): void {
    // Remove any existing context menu
    const existing = document.querySelector('.scout-context-menu');
    existing?.remove();
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'scout-context-menu';
    menu.style.left = `${options.position.x}px`;
    menu.style.top = `${options.position.y}px`;
    
    // Add items
    options.items.forEach(item => {
      if (item.separator) {
        const separator = document.createElement('div');
        separator.className = 'scout-context-menu-separator';
        menu.appendChild(separator);
      } else {
        const menuItem = document.createElement('div');
        menuItem.className = 'scout-context-menu-item';
        if (item.disabled) {
          menuItem.classList.add('disabled');
        }
        
        if (item.icon) {
          const icon = document.createElement('span');
          icon.className = 'scout-context-menu-icon';
          icon.textContent = item.icon;
          menuItem.appendChild(icon);
        }
        
        const label = document.createElement('span');
        label.textContent = item.label;
        menuItem.appendChild(label);
        
        if (!item.disabled) {
          menuItem.onclick = () => {
            item.action();
            menu.remove();
          };
        }
        
        menu.appendChild(menuItem);
      }
    });
    
    // Add to DOM
    document.body.appendChild(menu);
    
    // Add styles if not already present
    this._ensureContextMenuStyles();
    
    // Close on outside click
    const closeHandler = (event: MouseEvent) => {
      if (!menu.contains(event.target as Node)) {
        menu.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
    }, 0);
  }

  private _ensureModalStyles(): void {
    if (!document.querySelector('#scout-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'scout-modal-styles';
      style.textContent = `
        .scout-modal-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .scout-modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .scout-modal {
          position: relative;
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        
        .scout-modal-small { width: 400px; }
        .scout-modal-medium { width: 600px; }
        .scout-modal-large { width: 800px; }
        
        .scout-modal-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .scout-modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .scout-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .scout-modal-content {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }
        
        .scout-modal-footer {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .scout-button {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .scout-button-primary {
          background: #3b82f6;
          color: white;
        }
        
        .scout-button-secondary {
          background: #e5e7eb;
          color: #374151;
        }
        
        .scout-button-danger {
          background: #ef4444;
          color: white;
        }
      `;
      document.head.appendChild(style);
    }
  }

  private _ensureToastStyles(): void {
    if (!document.querySelector('#scout-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'scout-toast-styles';
      style.textContent = `
        .scout-toast {
          position: fixed;
          padding: 12px 20px;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          z-index: 10001;
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.3s;
          max-width: 300px;
        }
        
        .scout-toast-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .scout-toast-info { background: #3b82f6; }
        .scout-toast-success { background: #10b981; }
        .scout-toast-warning { background: #f59e0b; }
        .scout-toast-error { background: #ef4444; }
        
        .scout-toast-top { top: 20px; }
        .scout-toast-bottom { bottom: 20px; }
        .scout-toast-top-left { top: 20px; left: 20px; }
        .scout-toast-top-right { top: 20px; right: 20px; }
        .scout-toast-bottom-left { bottom: 20px; left: 20px; }
        .scout-toast-bottom-right { bottom: 20px; right: 20px; }
      `;
      document.head.appendChild(style);
    }
  }

  private _ensureContextMenuStyles(): void {
    if (!document.querySelector('#scout-context-menu-styles')) {
      const style = document.createElement('style');
      style.id = 'scout-context-menu-styles';
      style.textContent = `
        .scout-context-menu {
          position: fixed;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 10002;
          min-width: 200px;
          padding: 4px 0;
        }
        
        .scout-context-menu-item {
          padding: 8px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }
        
        .scout-context-menu-item:hover:not(.disabled) {
          background: #f3f4f6;
        }
        
        .scout-context-menu-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .scout-context-menu-separator {
          height: 1px;
          background: #e5e7eb;
          margin: 4px 0;
        }
        
        .scout-context-menu-icon {
          width: 16px;
          text-align: center;
        }
      `;
      document.head.appendChild(style);
    }
  }
}
/**
 * Settings Implementation
 * Provides persistent key-value storage for extensions
 */

import { Settings } from './types';
import { EventEmitter } from 'events';

export class SettingsImpl extends EventEmitter implements Settings {
  private _settings: Map<string, string> = new Map();
  private _changeListeners: Set<(key: string, value: string) => void> = new Set();
  private _storageKey = 'scout-extension-settings';

  constructor() {
    super();
    this._loadSettings();
  }

  get(key: string): string | undefined {
    return this._settings.get(key);
  }

  set(key: string, value: string): void {
    const oldValue = this._settings.get(key);
    this._settings.set(key, value);
    
    if (oldValue !== value) {
      this._notifyChange(key, value);
    }
  }

  getAll(): { [key: string]: string } {
    const obj: { [key: string]: string } = {};
    this._settings.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  async saveAsync(): Promise<void> {
    try {
      // Save to localStorage and backend
      if (typeof window !== 'undefined' && window.localStorage) {
        const serialized = JSON.stringify(Array.from(this._settings.entries()));
        window.localStorage.setItem(this._storageKey, serialized);
      }
      
      // In real implementation, would also sync to backend
      await this._syncToBackend();
      
      this.emit('saved', this.getAll());
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  erase(key: string): void {
    const existed = this._settings.has(key);
    this._settings.delete(key);
    
    if (existed) {
      this._notifyChange(key, undefined as any);
    }
  }

  onChange(callback: (key: string, value: string) => void): void {
    this._changeListeners.add(callback);
  }

  offChange(callback: (key: string, value: string) => void): void {
    this._changeListeners.delete(callback);
  }

  private _loadSettings(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const serialized = window.localStorage.getItem(this._storageKey);
        if (serialized) {
          const entries = JSON.parse(serialized);
          this._settings = new Map(entries);
        }
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  private _notifyChange(key: string, value: string): void {
    this._changeListeners.forEach(listener => {
      try {
        listener(key, value);
      } catch (error) {
        console.error('Settings change listener error:', error);
      }
    });
    
    this.emit('changed', { key, value });
  }

  private async _syncToBackend(): Promise<void> {
    // In real implementation, would POST to settings API
    // For now, just simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
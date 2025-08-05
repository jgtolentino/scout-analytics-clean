/**
 * Environment Implementation
 * Provides information about the runtime environment
 */

import { Environment } from './types';

export class EnvironmentImpl implements Environment {
  apiVersion = '1.0.0';
  mode: 'authoring' | 'viewing' | 'server' = 'viewing';
  locale = 'en-US';
  operatingSystem = 'Unknown';
  tableauVersion?: string;
  dashboardVersion = '5.0.0';
  
  // Scout additions
  user?: {
    id: string;
    name: string;
    email: string;
  };
  
  organization?: {
    id: string;
    name: string;
  };
  
  theme?: 'light' | 'dark';

  async initialize(): Promise<void> {
    // Detect environment
    this._detectMode();
    this._detectOS();
    this._detectLocale();
    this._detectTheme();
    await this._loadUserInfo();
  }

  private _detectMode(): void {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (url.includes('/edit') || url.includes('/authoring')) {
        this.mode = 'authoring';
      } else if (url.includes('/server') || window.location.protocol === 'https:') {
        this.mode = 'server';
      } else {
        this.mode = 'viewing';
      }
    }
  }

  private _detectOS(): void {
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (userAgent.includes('win')) {
        this.operatingSystem = 'Windows';
      } else if (userAgent.includes('mac')) {
        this.operatingSystem = 'macOS';
      } else if (userAgent.includes('linux')) {
        this.operatingSystem = 'Linux';
      } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        this.operatingSystem = 'iOS';
      } else if (userAgent.includes('android')) {
        this.operatingSystem = 'Android';
      }
    }
  }

  private _detectLocale(): void {
    if (typeof navigator !== 'undefined') {
      this.locale = navigator.language || 'en-US';
    }
  }

  private _detectTheme(): void {
    if (typeof window !== 'undefined') {
      // Check CSS variable or media query
      const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      this.theme = isDark ? 'dark' : 'light';
      
      // Check for saved preference
      const savedTheme = localStorage.getItem('scout-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.theme = savedTheme;
      }
    }
  }

  private async _loadUserInfo(): Promise<void> {
    try {
      // In real implementation, would fetch from auth service
      // For now, using mock data
      this.user = {
        id: 'user-123',
        name: 'Scout User',
        email: 'user@scout.example'
      };
      
      this.organization = {
        id: 'org-456',
        name: 'Scout Organization'
      };
    } catch (error) {
      console.warn('Failed to load user info:', error);
    }
  }
}
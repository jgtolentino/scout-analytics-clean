/**
 * Centralized API client for AdsBot Dashboard
 * Handles all communication with the Express API backend
 */

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface FilterParams {
  from?: string;
  to?: string;
  region?: string;
  category?: string;
  brand?: string;
  sku?: string;
  ageGroup?: string;
  gender?: string;
  weekendOnly?: boolean;
  limit?: number;
  offset?: number;
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE) {
    this.baseURL = baseURL;
    // Try to restore token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('scout_auth_token');
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (this.token) return;

    try {
      // Auto-login with demo credentials for development
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@scout.com',
          password: 'demo123'
        }),
      });

      const data = await response.json();
      if (data.success && data.token) {
        this.token = data.token;
        localStorage.setItem('scout_auth_token', data.token);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
      // Continue without auth - API will return errors which we'll handle
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      // Ensure we're authenticated before making requests
      await this.ensureAuthenticated();

      const url = `${this.baseURL}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      // Add authorization header if we have a token
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown API error' 
      };
    }
  }

  // Health check
  async health() {
    return this.request('/api/health');
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  async profile() {
    return this.request('/api/auth/profile');
  }

  // KPI endpoints with filters
  async getSummary(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/summary?${params}`);
  }

  async getTransactions(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/transactions?${params}`);
  }

  async getCategories(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/categories?${params}`);
  }

  async getRegions(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/regions?${params}`);
  }

  async getBrands(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/brands?${params}`);
  }

  // Scout Analytics - Unified singleton endpoint
  async getScoutAnalytics(filters: FilterParams & { period?: '7d' | '30d' | '90d' } = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/scout/analytics?${params}`);
  }

  async getScoutHealth() {
    return this.request('/api/scout/health');
  }

  // Analytics endpoints (legacy - use getScoutAnalytics for new implementations)
  async getVolume(filters: FilterParams & { aggregation?: 'hourly' | 'daily' | 'peak' } = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/transactions?${params}`); // Map to transactions endpoint
  }

  async getCategoryMix(filters: FilterParams & { breakdown?: 'category' | 'sku' } = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/categories?${params}`);
  }

  async getRegionalPerformance(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/regions?${params}`);
  }

  async getSubstitution(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/categories?${params}`); // Use categories for substitution data
  }

  async getBasketAnalysis(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/transactions?${params}`); // Use transactions for basket analysis
  }

  async getDemographics(filters: FilterParams & { agg?: 'barangay' | 'region' } = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/kpi/regions?${params}`); // Map to regions endpoint
  }

  // AI/Chat endpoints
  async chatWithBot(query: string, context?: any) {
    return this.request('/api/scoutbot/query', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });
  }

  async getAIInsights(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/ai/insights?${params}`);
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export types for use in components
export type { APIResponse, FilterParams };
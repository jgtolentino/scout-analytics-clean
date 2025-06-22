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

  constructor(baseURL: string = API_BASE) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
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

  // Analytics endpoints
  async getVolume(filters: FilterParams & { aggregation?: 'hourly' | 'daily' | 'peak' } = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/analytics/volume?${params}`);
  }

  async getCategoryMix(filters: FilterParams & { breakdown?: 'category' | 'sku' } = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/analytics/category-mix?${params}`);
  }

  async getRegionalPerformance(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/analytics/regional-performance?${params}`);
  }

  async getSubstitution(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/analytics/substitution?${params}`);
  }

  async getBasketAnalysis(filters: FilterParams = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/analytics/basket-analysis?${params}`);
  }

  async getDemographics(filters: FilterParams & { agg?: 'barangay' | 'region' } = {}) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/api/analytics/demographics?${params}`);
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
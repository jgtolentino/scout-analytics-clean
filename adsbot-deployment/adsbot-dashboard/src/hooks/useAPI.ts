/**
 * React Query hooks for AdsBot API endpoints
 * Provides loading states, error handling, and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, FilterParams } from '@/lib/api';

// Query keys for caching
export const queryKeys = {
  health: ['health'],
  summary: (filters: FilterParams) => ['summary', filters],
  transactions: (filters: FilterParams) => ['transactions', filters],
  categories: (filters: FilterParams) => ['categories', filters],
  regions: (filters: FilterParams) => ['regions', filters],
  brands: (filters: FilterParams) => ['brands', filters],
  volume: (filters: FilterParams & { aggregation?: string }) => ['volume', filters],
  categoryMix: (filters: FilterParams & { breakdown?: string }) => ['categoryMix', filters],
  regionalPerformance: (filters: FilterParams) => ['regionalPerformance', filters],
  substitution: (filters: FilterParams) => ['substitution', filters],
  basketAnalysis: (filters: FilterParams) => ['basketAnalysis', filters],
  demographics: (filters: FilterParams & { agg?: string }) => ['demographics', filters],
  aiInsights: (filters: FilterParams) => ['aiInsights', filters],
};

// Health check hook
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.health(),
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000, // Consider fresh for 10 seconds
  });
}

// Authentication hooks
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.profile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      apiClient.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data on logout
    },
  });
}

// KPI hooks
export function useSummary(filters: FilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.summary(filters),
    queryFn: () => apiClient.getSummary(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true, // Always enabled for dashboard
  });
}

export function useTransactions(filters: FilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: () => apiClient.getTransactions(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCategories(filters: FilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.categories(filters),
    queryFn: () => apiClient.getCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes (categories change less frequently)
  });
}

export function useRegions(filters: FilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.regions(filters),
    queryFn: () => apiClient.getRegions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBrands(filters: FilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.brands(filters),
    queryFn: () => apiClient.getBrands(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Analytics hooks
export function useVolume(filters: FilterParams & { aggregation?: 'hourly' | 'daily' | 'peak' } = {}) {
  return useQuery({
    queryKey: queryKeys.volume(filters),
    queryFn: () => apiClient.getVolume(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCategoryMix(filters: FilterParams & { breakdown?: 'category' | 'sku' } = {}) {
  return useQuery({
    queryKey: queryKeys.categoryMix(filters),
    queryFn: () => apiClient.getCategoryMix(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRegionalPerformance(filters: FilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.regionalPerformance(filters),
    queryFn: () => apiClient.getRegionalPerformance(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSubstitution(filters: FilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.substitution(filters),
    queryFn: () => apiClient.getSubstitution(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBasketAnalysis(filters: FilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.basketAnalysis(filters),
    queryFn: () => apiClient.getBasketAnalysis(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useDemographics(filters: FilterParams & { agg?: 'barangay' | 'region' } = {}) {
  return useQuery({
    queryKey: queryKeys.demographics(filters),
    queryFn: () => apiClient.getDemographics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// AI/Chat hooks
export function useAIInsights(filters: FilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.aiInsights(filters),
    queryFn: () => apiClient.getAIInsights(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes (AI insights change less frequently)
  });
}

export function useChatBot() {
  return useMutation({
    mutationFn: ({ query, context }: { query: string; context?: any }) =>
      apiClient.chatWithBot(query, context),
  });
}

// Utility hook to invalidate all data queries when filters change
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return (filterKeys?: string[]) => {
    if (filterKeys) {
      filterKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    } else {
      // Invalidate all data queries except health and profile
      queryClient.invalidateQueries({
        predicate: (query) => 
          !['health', 'profile'].includes(query.queryKey[0] as string)
      });
    }
  };
}
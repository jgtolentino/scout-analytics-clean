/**
 * useScoutRuntime Hook - React integration for Scout Runtime API
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { scout, ScoutAPI, ScoutEnvironment } from '../lib/scout.runtime';
import { eventBus, ScoutEventType, ScopedEventBus } from '../lib/scoutEventBus';
import type { DashboardConfig, DashboardZoneType, Parameter, Filter } from '../components/Dashboard';

interface UseScoutRuntimeOptions {
  source?: string;
  autoInitialize?: boolean;
  config?: DashboardConfig;
}

interface ScoutRuntimeState {
  initialized: boolean;
  loading: boolean;
  error: Error | null;
  dashboardName: string;
  zones: DashboardZoneType[];
  parameters: Parameter[];
  filters: Filter[];
  environment: ScoutEnvironment;
}

export const useScoutRuntime = (options: UseScoutRuntimeOptions = {}) => {
  const { source = 'unknown', autoInitialize = true, config } = options;
  
  const [state, setState] = useState<ScoutRuntimeState>({
    initialized: false,
    loading: false,
    error: null,
    dashboardName: '',
    zones: [],
    parameters: [],
    filters: [],
    environment: scout.environment
  });

  const scopedEventBus = useRef<ScopedEventBus>();
  const isMounted = useRef(true);

  // Initialize Scout runtime
  const initialize = useCallback(async (dashboardConfig?: DashboardConfig) => {
    if (state.initialized) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await scout.initializeAsync(dashboardConfig || config);
      
      if (isMounted.current) {
        const content = scout.dashboardContent;
        setState(prev => ({
          ...prev,
          initialized: true,
          loading: false,
          dashboardName: content.dashboard.name,
          zones: content.dashboard.zones,
          parameters: content.parameters.getAll(),
          filters: content.filters.getAll(),
          environment: scout.environment
        }));
      }
    } catch (error) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error
        }));
      }
    }
  }, [state.initialized, config]);

  // Create scoped event bus
  useEffect(() => {
    scopedEventBus.current = eventBus.createScope(source);
  }, [source]);

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && !state.initialized && !state.loading) {
      initialize();
    }
  }, [autoInitialize, state.initialized, state.loading, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Event handlers
  const emitEvent = useCallback((type: ScoutEventType | string, data: any, metadata?: any) => {
    return scopedEventBus.current?.emit(type, data, metadata);
  }, []);

  const onEvent = useCallback((type: ScoutEventType | string, handler: (data: any) => void) => {
    scopedEventBus.current?.on(type, handler);
    return () => scopedEventBus.current?.off(type, handler);
  }, []);

  // Zone management
  const addZone = useCallback((zone: DashboardZoneType) => {
    scout.addZone(zone);
    setState(prev => ({
      ...prev,
      zones: [...prev.zones, zone]
    }));
    emitEvent(ScoutEventType.ZONE_ADDED, { zone });
  }, [emitEvent]);

  const updateZone = useCallback((zoneId: string, updates: Partial<DashboardZoneType>) => {
    scout.updateZone(zoneId, updates);
    setState(prev => ({
      ...prev,
      zones: prev.zones.map(z => z.id === zoneId ? { ...z, ...updates } : z)
    }));
    emitEvent(ScoutEventType.ZONE_UPDATED, { zoneId, updates });
  }, [emitEvent]);

  const removeZone = useCallback((zoneId: string) => {
    scout.removeZone(zoneId);
    setState(prev => ({
      ...prev,
      zones: prev.zones.filter(z => z.id !== zoneId)
    }));
    emitEvent(ScoutEventType.ZONE_REMOVED, { zoneId });
  }, [emitEvent]);

  // Filter management
  const applyFilter = useCallback(async (filterId: string, values: any) => {
    await scout.dashboardContent.filters.applyFilterAsync(filterId, values);
    setState(prev => ({
      ...prev,
      filters: prev.filters.map(f => 
        f.id === filterId ? { ...f, value: values, applied: true } : f
      )
    }));
    emitEvent(ScoutEventType.FILTER_CHANGED, { filterId, values });
  }, [emitEvent]);

  const clearFilter = useCallback(async (filterId: string) => {
    await scout.dashboardContent.filters.clearFilterAsync(filterId);
    setState(prev => ({
      ...prev,
      filters: prev.filters.map(f => 
        f.id === filterId ? { ...f, value: null, applied: false } : f
      )
    }));
    emitEvent(ScoutEventType.FILTER_CLEARED, { filterId });
  }, [emitEvent]);

  // Parameter management
  const updateParameter = useCallback(async (paramId: string, value: any) => {
    await scout.dashboardContent.parameters.changeValueAsync(paramId, value);
    setState(prev => ({
      ...prev,
      parameters: prev.parameters.map(p => 
        p.id === paramId ? { ...p, value } : p
      )
    }));
    emitEvent(ScoutEventType.PARAMETER_CHANGED, { paramId, value });
  }, [emitEvent]);

  // Settings management
  const getSetting = useCallback((key: string): string | undefined => {
    return scout.settings.get(key);
  }, []);

  const setSetting = useCallback((key: string, value: string) => {
    scout.settings.set(key, value);
  }, []);

  // UI helpers
  const showModal = useCallback((component: string, props?: any) => {
    scout.ui.showModal(component, props);
    emitEvent(ScoutEventType.MODAL_OPENED, { component, props });
  }, [emitEvent]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    scout.ui.showToast(message, type);
    emitEvent(ScoutEventType.TOAST_SHOWN, { message, type });
  }, [emitEvent]);

  // AI integration
  const requestAIInsight = useCallback(async (context: any) => {
    emitEvent(ScoutEventType.AI_INSIGHT_REQUESTED, context);
    return await scout.requestAIInsight(context);
  }, [emitEvent]);

  const explainDataPoint = useCallback(async (zoneId: string, dataPoint: any) => {
    emitEvent(ScoutEventType.AI_EXPLAIN_REQUESTED, { zoneId, dataPoint });
    return await scout.explainDataPoint(zoneId, dataPoint);
  }, [emitEvent]);

  // Data helpers
  const refreshZoneData = useCallback((zoneId: string) => {
    emitEvent(ScoutEventType.DATA_REQUESTED, { zoneId });
  }, [emitEvent]);

  const getZoneData = useCallback(async (zoneId: string) => {
    const zone = state.zones.find(z => z.id === zoneId);
    if (!zone) return null;

    const worksheet = scout.dashboardContent.dashboard.worksheets
      .find(w => w.id === zoneId);
    
    if (worksheet) {
      return await worksheet.getSummaryDataAsync();
    }
    return null;
  }, [state.zones]);

  return {
    // State
    ...state,
    
    // Core API
    scout,
    eventBus: scopedEventBus.current,
    
    // Lifecycle
    initialize,
    
    // Zone management
    addZone,
    updateZone,
    removeZone,
    
    // Filter management
    applyFilter,
    clearFilter,
    getActiveFilters: () => state.filters.filter(f => f.applied),
    
    // Parameter management
    updateParameter,
    getParameter: (name: string) => state.parameters.find(p => p.name === name),
    
    // Settings
    getSetting,
    setSetting,
    
    // UI
    showModal,
    showToast,
    
    // AI
    requestAIInsight,
    explainDataPoint,
    
    // Data
    refreshZoneData,
    getZoneData,
    
    // Events
    emitEvent,
    onEvent
  };
};
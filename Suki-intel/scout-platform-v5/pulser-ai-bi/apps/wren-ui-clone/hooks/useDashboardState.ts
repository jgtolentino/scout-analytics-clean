/**
 * Dashboard State Hook - Manages dashboard configuration state with undo/redo
 */

import { useState, useCallback, useRef } from 'react';

interface DashboardState {
  config: any;
  history: any[];
  historyIndex: number;
}

export const useDashboardState = (initialConfig: any) => {
  const [state, setState] = useState<DashboardState>({
    config: initialConfig || {
      title: 'New Dashboard',
      description: '',
      zones: [],
      parameters: [],
      filters: [],
      theme: {
        colorScheme: 'light',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        fontFamily: 'system-ui'
      },
      layout: {
        type: 'grid',
        columns: 12,
        rows: 8,
        gap: 16
      }
    },
    history: [],
    historyIndex: -1
  });

  const maxHistorySize = 50;

  // Add state to history
  const addToHistory = useCallback((newConfig: any) => {
    setState(prev => {
      const newHistory = [
        ...prev.history.slice(0, prev.historyIndex + 1),
        newConfig
      ].slice(-maxHistorySize);

      return {
        config: newConfig,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  // Update config with history tracking
  const updateConfig = useCallback((updates: any) => {
    const newConfig = { ...state.config, ...updates };
    addToHistory(newConfig);
  }, [state.config, addToHistory]);

  // Add zone
  const addZone = useCallback((zone: any) => {
    const newConfig = {
      ...state.config,
      zones: [...state.config.zones, zone]
    };
    addToHistory(newConfig);
  }, [state.config, addToHistory]);

  // Remove zone
  const removeZone = useCallback((zoneId: string) => {
    const newConfig = {
      ...state.config,
      zones: state.config.zones.filter((z: any) => z.id !== zoneId)
    };
    addToHistory(newConfig);
  }, [state.config, addToHistory]);

  // Update zone
  const updateZone = useCallback((zoneId: string, updates: any) => {
    const newConfig = {
      ...state.config,
      zones: state.config.zones.map((z: any) => 
        z.id === zoneId ? { ...z, ...updates } : z
      )
    };
    addToHistory(newConfig);
  }, [state.config, addToHistory]);

  // Apply filter
  const applyFilter = useCallback((filterId: string, filterConfig: any) => {
    const newConfig = {
      ...state.config,
      filters: state.config.filters.map((f: any) => 
        f.id === filterId ? filterConfig : f
      )
    };
    addToHistory(newConfig);
  }, [state.config, addToHistory]);

  // Update parameter
  const updateParameter = useCallback((paramId: string, value: any) => {
    const newConfig = {
      ...state.config,
      parameters: state.config.parameters.map((p: any) => 
        p.id === paramId ? { ...p, value } : p
      )
    };
    addToHistory(newConfig);
  }, [state.config, addToHistory]);

  // Undo
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          config: prev.history[newIndex],
          historyIndex: newIndex
        };
      }
      return prev;
    });
  }, []);

  // Redo
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          config: prev.history[newIndex],
          historyIndex: newIndex
        };
      }
      return prev;
    });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // Initialize history if empty
  if (state.history.length === 0 && state.config) {
    addToHistory(state.config);
  }

  return {
    config: state.config,
    updateConfig,
    addZone,
    removeZone,
    updateZone,
    applyFilter,
    updateParameter,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
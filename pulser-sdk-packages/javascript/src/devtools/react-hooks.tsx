/**
 * React hooks for Pulser DevTools integration
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { PulserDevTools, AgentLog, DevToolsConfig } from './index';

interface PulserDevToolsContextValue {
  devTools: PulserDevTools;
  logs: AgentLog[];
  isOverlayVisible: boolean;
  toggleOverlay: () => void;
  clearLogs: () => void;
  exportLogs: () => void;
}

const PulserDevToolsContext = createContext<PulserDevToolsContextValue | null>(null);

export interface PulserDevToolsProviderProps {
  children: React.ReactNode;
  config?: Partial<DevToolsConfig>;
}

export function PulserDevToolsProvider({ children, config }: PulserDevToolsProviderProps) {
  const [devTools] = useState(() => new PulserDevTools(config));
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  useEffect(() => {
    // Update logs when new log is added
    const handleLog = () => {
      setLogs(devTools.getAgentLogs());
    };

    const handleClear = () => {
      setLogs([]);
    };

    devTools.on('log', handleLog);
    devTools.on('clear', handleClear);

    // Load initial logs
    setLogs(devTools.getAgentLogs());

    return () => {
      devTools.off('log', handleLog);
      devTools.off('clear', handleClear);
    };
  }, [devTools]);

  const toggleOverlay = useCallback(() => {
    devTools.toggleOverlay();
    setIsOverlayVisible(!isOverlayVisible);
  }, [devTools, isOverlayVisible]);

  const clearLogs = useCallback(() => {
    devTools.clearLogs();
  }, [devTools]);

  const exportLogs = useCallback(() => {
    devTools.exportLogs();
  }, [devTools]);

  const value: PulserDevToolsContextValue = {
    devTools,
    logs,
    isOverlayVisible,
    toggleOverlay,
    clearLogs,
    exportLogs
  };

  return (
    <PulserDevToolsContext.Provider value={value}>
      {children}
    </PulserDevToolsContext.Provider>
  );
}

export function usePulserDevTools() {
  const context = useContext(PulserDevToolsContext);
  if (!context) {
    throw new Error('usePulserDevTools must be used within PulserDevToolsProvider');
  }
  return context;
}

export function useAgentLogger() {
  const { devTools } = usePulserDevTools();

  const logAgentCall = useCallback((log: Omit<AgentLog, 'id' | 'timestamp'>) => {
    devTools.logAgentCall(log);
  }, [devTools]);

  return { logAgentCall };
}

// Convenience component for DevTools button
export function PulserDevToolsButton() {
  const { toggleOverlay, isOverlayVisible, logs } = usePulserDevTools();

  return (
    <button
      onClick={toggleOverlay}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#9333EA',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
        zIndex: 999998,
        fontSize: 12,
        fontWeight: 'bold'
      }}
      title={`Pulser DevTools (${logs.length} logs)`}
    >
      {logs.length}
    </button>
  );
}
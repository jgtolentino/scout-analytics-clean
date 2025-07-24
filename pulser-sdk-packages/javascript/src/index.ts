/**
 * Pulser SDK - Enterprise AI Agent Orchestration Platform
 * @packageDocumentation
 */

export { PulserClient } from './core/client';
export { PulserAgent } from './agents/agent';
export { Orchestrator } from './core/orchestrator';

// Types
export type {
  AgentConfig,
  AgentCapability,
  ExecuteOptions,
  TaskResult,
  PulserClientOptions,
  WorkflowConfig,
  WorkflowStep
} from './types';

// Utilities
export { logger } from './utils/logger';
export { retry } from './utils/retry';
export { EventBus } from './utils/events';

// Constants
export const VERSION = '4.0.0';
export const DEFAULT_BASE_URL = 'https://api.pulser.ai';

// Re-export everything from submodules
export * from './agents';
export * from './core';
export * from './types';
export * from './utils';

// DevTools exports
export { PulserDevTools, type AgentLog, type DevToolsConfig } from './devtools';
export * from './devtools/react-hooks';

// Middleware exports
export { 
  createPulserMiddleware as createNextJsMiddleware,
  pulserMiddleware as nextJsMiddleware,
  pulserMiddlewareConfig 
} from './middleware/nextjs';
export { 
  createPulserMiddleware as createExpressMiddleware,
  createPulserErrorHandler,
  createAgentLoggingMiddleware,
  pulserMiddleware as expressMiddleware 
} from './middleware/express';
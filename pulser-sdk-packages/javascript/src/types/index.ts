/**
 * Type definitions for Pulser SDK
 */

export interface PulserClientOptions {
  apiKey: string;
  baseUrl?: string;
  environment?: 'development' | 'staging' | 'production';
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  telemetry?: TelemetryOptions;
  proxy?: ProxyOptions;
  onError?: (error: PulserError) => void;
}

export interface AgentConfig {
  name: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  capabilities?: AgentCapability[];
  memoryEnabled?: boolean;
  timeout?: number;
  retryCount?: number;
  metadata?: Record<string, any>;
}

export type AgentCapability = 
  | 'text_generation'
  | 'image_analysis'
  | 'code_generation'
  | 'data_analysis'
  | 'translation'
  | 'summarization'
  | 'classification'
  | 'custom';

export interface ExecuteOptions {
  task: string;
  input: Record<string, any>;
  stream?: boolean;
  timeout?: number;
  signal?: AbortSignal;
}

export interface TaskResult {
  success: boolean;
  output?: any;
  error?: string;
  metadata?: {
    duration: number;
    tokensUsed?: number;
    model?: string;
    timestamp: string;
  };
}

export interface WorkflowConfig {
  name: string;
  description?: string;
  steps: WorkflowStep[];
  parallel?: boolean;
  errorHandling?: 'stop' | 'continue' | 'retry';
  maxRetries?: number;
}

export interface WorkflowStep {
  id?: string;
  agent: string;
  task: string;
  input?: Record<string, any>;
  dependsOn?: string[];
  condition?: (previousResults: Record<string, TaskResult>) => boolean;
}

export interface TelemetryOptions {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  sampleRate?: number;
}

export interface ProxyOptions {
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

export class PulserError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'PulserError';
  }
}

export interface Agent {
  id: string;
  name: string;
  config: AgentConfig;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
  updatedAt: Date;
  
  execute(options: ExecuteOptions): Promise<TaskResult>;
  stream(options: ExecuteOptions): AsyncIterable<any>;
  update(config: Partial<AgentConfig>): Promise<void>;
  delete(): Promise<void>;
  getMetrics(): Promise<AgentMetrics>;
}

export interface AgentMetrics {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  tokensUsed: number;
  lastExecutionTime?: Date;
  errors: number;
}
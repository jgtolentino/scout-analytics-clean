/**
 * Express middleware for Pulser SDK
 * Provides automatic logging, token injection, and request tracking
 */

import { Request, Response, NextFunction } from 'express';

export interface PulserExpressConfig {
  apiPrefix?: string;
  injectToken?: boolean;
  enableLogging?: boolean;
  enableMetrics?: boolean;
  tokenHeader?: string;
  tokenEnvVar?: string;
  errorHandler?: (error: any, req: Request, res: Response) => void;
}

const defaultConfig: PulserExpressConfig = {
  apiPrefix: '/api',
  injectToken: true,
  enableLogging: true,
  enableMetrics: true,
  tokenHeader: 'Authorization',
  tokenEnvVar: 'PULSER_API_TOKEN'
};

export function createPulserMiddleware(config: PulserExpressConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return function pulserMiddleware(req: Request, res: Response, next: NextFunction) {
    // Check if this is a Pulser API route
    if (!req.path.startsWith(finalConfig.apiPrefix!)) {
      return next();
    }

    const startTime = Date.now();
    const requestId = generateRequestId();

    // Add request ID
    req.headers['x-pulser-request-id'] = requestId;
    res.setHeader('X-Pulser-Request-ID', requestId);

    // Inject authentication token if configured
    if (finalConfig.injectToken && !req.headers[finalConfig.tokenHeader!.toLowerCase()]) {
      const token = process.env[finalConfig.tokenEnvVar!];
      if (token) {
        req.headers[finalConfig.tokenHeader!.toLowerCase()] = `Bearer ${token}`;
      }
    }

    // Log incoming request
    if (finalConfig.enableLogging) {
      console.log(`[Pulser Express] ${req.method} ${req.path}`, {
        requestId,
        timestamp: new Date().toISOString(),
        query: req.query,
        body: req.body,
        headers: req.headers
      });
    }

    // Track response
    const originalSend = res.send;
    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      
      // Add response headers
      res.setHeader('X-Pulser-Response-Time', `${duration}ms`);

      // Log response
      if (finalConfig.enableLogging) {
        console.log(`[Pulser Express] Response ${res.statusCode}`, {
          requestId,
          duration,
          status: res.statusCode
        });
      }

      // Emit metrics
      if (finalConfig.enableMetrics) {
        emitMetrics({
          route: req.path,
          method: req.method,
          status: res.statusCode,
          duration,
          requestId
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

// Error handling middleware
export function createPulserErrorHandler(config: PulserExpressConfig = {}) {
  return function pulserErrorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-pulser-request-id'] || generateRequestId();

    console.error(`[Pulser Express Error]`, {
      requestId,
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });

    if (config.errorHandler) {
      config.errorHandler(error, req, res);
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  };
}

// Agent logging middleware
export function createAgentLoggingMiddleware() {
  return function agentLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.path.includes('/agent') && req.method === 'POST') {
      const startTime = Date.now();
      const originalJson = res.json;

      res.json = function(data: any) {
        const duration = Date.now() - startTime;

        // Log agent call
        if (typeof window !== 'undefined' && (window as any).__pulserDevTools) {
          (window as any).__pulserDevTools.logAgentCall({
            agent: req.body?.agent || 'unknown',
            input: req.body,
            output: data,
            duration,
            mock: data?.mock || false
          });
        }

        return originalJson.call(this, data);
      };
    }

    next();
  };
}

// Helper functions
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function emitMetrics(metrics: any): void {
  // Can be customized to send to monitoring service
  if (process.env.PULSER_METRICS_ENDPOINT) {
    // Send metrics to endpoint
  }
}

// Default export
export const pulserMiddleware = createPulserMiddleware();
/**
 * Next.js middleware for Pulser SDK
 * Provides automatic logging, token injection, and request tracking
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface PulserMiddlewareConfig {
  apiRoutes?: string[];
  injectToken?: boolean;
  enableLogging?: boolean;
  enableMetrics?: boolean;
  tokenHeader?: string;
  tokenEnvVar?: string;
}

const defaultConfig: PulserMiddlewareConfig = {
  apiRoutes: ['/api/agent', '/api/pulser'],
  injectToken: true,
  enableLogging: true,
  enableMetrics: true,
  tokenHeader: 'Authorization',
  tokenEnvVar: 'PULSER_API_TOKEN'
};

export function createPulserMiddleware(config: PulserMiddlewareConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if this is a Pulser API route
    const isPulserRoute = finalConfig.apiRoutes?.some(route => pathname.startsWith(route));
    
    if (!isPulserRoute) {
      return NextResponse.next();
    }

    const startTime = Date.now();
    const requestId = generateRequestId();

    // Clone the request for modification
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set('X-Pulser-Request-ID', requestId);

    // Inject authentication token if configured
    if (finalConfig.injectToken && !modifiedHeaders.has(finalConfig.tokenHeader!)) {
      const token = process.env[finalConfig.tokenEnvVar!];
      if (token) {
        modifiedHeaders.set(finalConfig.tokenHeader!, `Bearer ${token}`);
      }
    }

    // Log incoming request
    if (finalConfig.enableLogging) {
      console.log(`[Pulser Middleware] ${request.method} ${pathname}`, {
        requestId,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(modifiedHeaders.entries()),
        query: Object.fromEntries(request.nextUrl.searchParams.entries())
      });
    }

    // Create modified request
    const modifiedRequest = new NextRequest(request.url, {
      headers: modifiedHeaders,
      method: request.method,
      body: request.body
    });

    // Get response
    const response = await NextResponse.next({
      request: modifiedRequest
    });

    // Add tracking headers to response
    response.headers.set('X-Pulser-Request-ID', requestId);
    response.headers.set('X-Pulser-Response-Time', `${Date.now() - startTime}ms`);

    // Log response
    if (finalConfig.enableLogging) {
      console.log(`[Pulser Middleware] Response ${response.status}`, {
        requestId,
        duration: Date.now() - startTime,
        status: response.status
      });
    }

    // Emit metrics if enabled
    if (finalConfig.enableMetrics && typeof window !== 'undefined') {
      emitMetrics({
        route: pathname,
        method: request.method,
        status: response.status,
        duration: Date.now() - startTime,
        requestId
      });
    }

    return response;
  };
}

// Helper function to generate request IDs
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to emit metrics (can be customized)
function emitMetrics(metrics: any): void {
  if (typeof window !== 'undefined' && (window as any).__pulserMetrics) {
    (window as any).__pulserMetrics.record(metrics);
  }
}

// Default middleware export
export const pulserMiddleware = createPulserMiddleware();

// Middleware config helper for Next.js
export const pulserMiddlewareConfig = {
  matcher: ['/api/:path*']
};

/**
 * Example usage in middleware.ts:
 * 
 * import { pulserMiddleware, pulserMiddlewareConfig } from 'pulser-sdk/middleware/nextjs';
 * 
 * export default pulserMiddleware;
 * export const config = pulserMiddlewareConfig;
 * 
 * // Or with custom configuration:
 * import { createPulserMiddleware } from 'pulser-sdk/middleware/nextjs';
 * 
 * export default createPulserMiddleware({
 *   apiRoutes: ['/api/agent', '/api/custom'],
 *   tokenEnvVar: 'MY_PULSER_TOKEN'
 * });
 */
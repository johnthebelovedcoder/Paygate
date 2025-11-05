import * as React from 'react';

type PerformanceMetrics = {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
};

type PerformanceConfig = {
  maxEntries: number;
  slowThreshold: number;
  reportToServer: boolean;
  reportUrl?: string;
};

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private config: PerformanceConfig;
  private enabled: boolean = true;

  private constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      maxEntries: config.maxEntries || 1000,
      slowThreshold: config.slowThreshold || 1000, // 1 second
      reportToServer: config.reportToServer || false,
      reportUrl: config.reportUrl || '/api/performance-metrics',
    };

    // Enable/disable based on environment
    this.enabled = process.env.NODE_ENV !== 'test';
  }

  static getInstance(config: Partial<PerformanceConfig> = {}): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    // Apply config updates if provided
    if (config) {
      Object.assign(PerformanceMonitor.instance.config, config);
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Measure the execution time of an async function
   */
  async measure<T>(
    name: string, 
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) return fn();

    const start = performance.now();
    
    try {
      const result = await fn();
      this.record(name, start, performance.now(), metadata);
      return result;
    } catch (error) {
      this.record(name, start, performance.now(), {
        ...metadata,
        error: error instanceof Error ? error.message : String(error),
        success: false
      });
      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  record(
    name: string, 
    startTime: number, 
    endTime: number, 
    metadata?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    const duration = endTime - startTime;
    const metric: PerformanceMetrics = {
      name,
      duration,
      timestamp: Date.now(),
      metadata
    };

    // Add to metrics array
    this.metrics.push(metric);

    // Remove oldest metrics if we've exceeded max entries
    if (this.metrics.length > this.config.maxEntries) {
      this.metrics.shift();
    }

    // Check if this was a slow operation
    if (duration > this.config.slowThreshold) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      
      if (this.config.reportToServer) {
        this.reportSlowOperation(metric);
      }
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics filtered by name
   */
  getMetricsByName(name: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get average duration for a specific operation
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Report slow operations to the server
   */
  private async reportSlowOperation(metric: PerformanceMetrics): Promise<void> {
    if (!this.config.reportToServer || !this.config.reportUrl) return;

    try {
      await fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metric,
          userAgent: navigator.userAgent,
          page: window.location.pathname,
        }),
      });
    } catch (error) {
      console.error('Failed to report slow operation:', error);
    }
  }
}

// Default export with default configuration
export const performanceMonitor = PerformanceMonitor.getInstance({
  maxEntries: 1000,
  slowThreshold: 1000, // 1 second
  reportToServer: process.env.NODE_ENV === 'production',
  reportUrl: '/api/performance-metrics',
});

// React hook for measuring component render performance
import * as React from 'react';

export function useMeasureRender(componentName: string): void {
  const startTimeRef = React.useRef<number>(0);
  const mountedRef = React.useRef<boolean>(false);
  const updateCountRef = React.useRef<number>(0);
  const monitorRef = React.useRef<PerformanceMonitor>();

  React.useEffect(() => {
    // Lazy initialize the performance monitor
    if (!monitorRef.current) {
      monitorRef.current = PerformanceMonitor.getInstance({});
    }
    
    const monitor = monitorRef.current;
    if (!monitor) return;
    
    const start = performance.now();
    startTimeRef.current = start;
    
    return () => {
      const end = performance.now();
      // Duration is calculated but not used in the record method
      // monitor.record method uses start and end times directly
      monitor.record(
        `render:${componentName}`,
        start,
        end,
        {
          type: mountedRef.current ? 'update' : 'mount',
          updateCount: updateCountRef.current,
        }
      );
      
      if (!mountedRef.current) {
        mountedRef.current = true;
      } else {
        updateCountRef.current++;
      }
    };
  }, [componentName]);
}

// Higher-order component for measuring render performance
export function withPerformanceMonitor<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T> & { displayName?: string; name?: string },
  componentName: string = WrappedComponent.displayName || WrappedComponent.name || 'Component'
): React.FC<T> {
  const displayName = `WithPerformanceMonitor(${componentName})`;
  
  const ComponentWithPerformanceMonitor: React.FC<T> = (props: T) => {
    useMeasureRender(componentName);
    return React.createElement(WrappedComponent, props);
  };
  
  ComponentWithPerformanceMonitor.displayName = displayName;
  
  return ComponentWithPerformanceMonitor;
}

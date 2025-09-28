// Performance monitoring and optimization utilities

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Performance monitoring
export const performanceMonitor = {
  // Measure function execution time
  measureTime: (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return end - start;
  },

  // Measure async function execution time
  measureTimeAsync: async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return { result, time: end - start };
  },

  // Monitor memory usage
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100,
        total: Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100,
        limit: Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100,
      };
    }
    return null;
  },

  // Log performance metrics
  logMetrics: (componentName: string) => {
    const memory = performanceMonitor.getMemoryUsage();
    if (memory) {
      console.log(`${componentName} Memory Usage:`, memory);
    }
  }
};

// Lazy loading utility
export const lazyLoad = {
  // Intersection Observer for lazy loading images
  createImageObserver: (callback: (entries: IntersectionObserverEntry[]) => void) => {
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
    });
  },

  // Load image with fallback
  loadImage: (src: string, fallback?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => {
        if (fallback) {
          resolve(fallback);
        } else {
          reject(new Error(`Failed to load image: ${src}`));
        }
      };
      img.src = src;
    });
  }
};

// Cache utilities
export const cacheUtils = {
  // Simple in-memory cache
  createCache: <T>(maxSize: number = 100) => {
    const cache = new Map<string, { data: T; timestamp: number }>();
    
    return {
      get: (key: string): T | null => {
        const item = cache.get(key);
        if (!item) return null;
        
        // Check if expired (5 minutes)
        if (Date.now() - item.timestamp > 5 * 60 * 1000) {
          cache.delete(key);
          return null;
        }
        
        return item.data;
      },
      
      set: (key: string, data: T): void => {
        // Remove oldest items if cache is full
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          if (firstKey) {
            cache.delete(firstKey);
          }
        }
        
        cache.set(key, { data, timestamp: Date.now() });
      },
      
      clear: (): void => {
        cache.clear();
      },
      
      size: (): number => {
        return cache.size;
      }
    };
  },

  // Generate cache key
  generateKey: (...parts: (string | number)[]): string => {
    return parts.join(':');
  }
};

// Bundle size optimization
export const bundleOptimization = {
  // Dynamic import helper
  dynamicImport: async <T>(importFn: () => Promise<T>): Promise<T> => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      throw error;
    }
  },

  // Preload critical resources
  preloadResource: (href: string, as: string = 'script') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};
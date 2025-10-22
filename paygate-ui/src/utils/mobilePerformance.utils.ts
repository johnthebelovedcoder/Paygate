// Mobile performance optimization utilities

// Debounce function for reducing frequent calls
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

// Throttle function for limiting execution frequency
export function throttle<F extends (...args: any[]) => any>(
  func: F,
  limit: number
): (...args: Parameters<F>) => void {
  let inThrottle: boolean;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;

  return (...args: Parameters<F>): void => {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan) || 0);
    }
  };
}

// Lazy loading for images
export function lazyLoadImages(): void {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  }
}

// Detect mobile device
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Detect slow network connection
export function isSlowConnection(): boolean {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  return false;
}

// Reduce image quality for mobile devices
export function getOptimalImageQuality(): 'high' | 'medium' | 'low' {
  if (isMobileDevice() || isSlowConnection()) {
    return 'low';
  }
  return 'high';
}

// Get optimal image dimensions based on device
export function getOptimalImageDimensions(maxWidth: number = 800): { width: number; height: number } {
  const isMobile = isMobileDevice();
  const screenWidth = window.innerWidth;
  
  // For mobile devices, use smaller dimensions
  if (isMobile) {
    return {
      width: Math.min(screenWidth - 40, maxWidth / 2),
      height: Math.min(screenWidth - 40, maxWidth / 2) * 0.75 // 4:3 aspect ratio
    };
  }
  
  // For desktop/tablet, use larger dimensions
  return {
    width: Math.min(screenWidth * 0.8, maxWidth),
    height: Math.min(screenWidth * 0.8, maxWidth) * 0.75 // 4:3 aspect ratio
  };
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if ('memory' in performance) {
    const memoryInfo = (performance as any).memory;
    const usedJSHeapSize = memoryInfo.usedJSHeapSize;
    const totalJSHeapSize = memoryInfo.totalJSHeapSize;
    const jsHeapSizeLimit = memoryInfo.jsHeapSizeLimit;
    
    // Log warning if memory usage is high
    const usagePercentage = (usedJSHeapSize / jsHeapSizeLimit) * 100;
    if (usagePercentage > 80) {
      console.warn(`High memory usage: ${usagePercentage.toFixed(2)}%`);
    }
  }
}

// Cleanup observers and timers to prevent memory leaks
export function cleanupResources(): void {
  // This would be called when components unmount
  // Implement specific cleanup based on your application needs
  if (typeof window !== 'undefined') {
    // Clear any timers
    // Remove event listeners
    // Disconnect observers
  }
}

// Virtual scrolling for large lists
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private itemCount: number;
  private renderItem: (index: number) => HTMLElement;
  private visibleStart: number = 0;
  private visibleEnd: number = 0;
  private buffer: number = 5;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    itemCount: number,
    renderItem: (index: number) => HTMLElement
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.itemCount = itemCount;
    this.renderItem = renderItem;
    
    this.init();
  }

  private init(): void {
    this.container.style.height = `${this.itemCount * this.itemHeight}px`;
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';
    
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    this.updateVisibleItems();
  }

  private handleScroll(): void {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    
    const newStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const newEnd = Math.min(
      this.itemCount,
      Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer
    );
    
    if (newStart !== this.visibleStart || newEnd !== this.visibleEnd) {
      this.visibleStart = newStart;
      this.visibleEnd = newEnd;
      this.updateVisibleItems();
    }
  }

  private updateVisibleItems(): void {
    // Clear existing items
    this.container.innerHTML = '';
    
    // Add spacer for items before visible range
    const topSpacer = document.createElement('div');
    topSpacer.style.height = `${this.visibleStart * this.itemHeight}px`;
    this.container.appendChild(topSpacer);
    
    // Render visible items
    for (let i = this.visibleStart; i < this.visibleEnd; i++) {
      const item = this.renderItem(i);
      item.style.position = 'relative';
      this.container.appendChild(item);
    }
    
    // Add spacer for items after visible range
    const bottomSpacer = document.createElement('div');
    bottomSpacer.style.height = `${(this.itemCount - this.visibleEnd) * this.itemHeight}px`;
    this.container.appendChild(bottomSpacer);
  }

  public updateItemCount(newCount: number): void {
    this.itemCount = newCount;
    this.container.style.height = `${this.itemCount * this.itemHeight}px`;
    this.updateVisibleItems();
  }
}

// Export all utilities
export default {
  debounce,
  throttle,
  lazyLoadImages,
  isMobileDevice,
  isSlowConnection,
  getOptimalImageQuality,
  getOptimalImageDimensions,
  monitorMemoryUsage,
  cleanupResources,
  VirtualScroller
};
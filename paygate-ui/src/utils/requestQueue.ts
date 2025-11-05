type RequestPriority = 'high' | 'normal' | 'low';

interface QueuedRequest<T> {
  promise: () => Promise<T>;
  priority: RequestPriority;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  id: symbol;
}

export class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests = 0;
  private maxConcurrent: number;
  private pendingRequests = new Map<symbol, () => void>();

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue<T>(
    promiseFn: () => Promise<T>,
    priority: RequestPriority = 'normal'
  ): { promise: Promise<T>; cancel: () => void } {
    const requestId = Symbol();
    
    const promise = new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        promise: promiseFn,
        priority,
        resolve,
        reject,
        id: requestId
      };
      
      this.addToQueue(request);
      this.processQueue();
    });

    const cancel = () => {
      const index = this.queue.findIndex(req => req.id === requestId);
      if (index !== -1) {
        const [request] = this.queue.splice(index, 1);
        request?.reject(new Error('Request was cancelled'));
      } else {
        const cancelRequest = this.pendingRequests.get(requestId);
        if (cancelRequest) {
          cancelRequest();
          this.pendingRequests.delete(requestId);
        }
      }
    };

    return { promise, cancel };
  }

  private addToQueue<T>(request: QueuedRequest<T>): void {
    const priorityValue = this.getPriorityValue(request.priority);
    const index = this.queue.findIndex(
      req => this.getPriorityValue(req.priority) > priorityValue
    );
    
    if (index === -1) {
      this.queue.push(request);
    } else {
      this.queue.splice(index, 0, request);
    }
  }

  private getPriorityValue(priority: RequestPriority): number {
    switch (priority) {
      case 'high': return 0;
      case 'normal': return 1;
      case 'low': return 2;
      default: return 1;
    }
  }

  private async processQueue(): Promise<void> {
    // Prevent infinite recursion if there are no available slots
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.activeRequests++;
    const abortController = new AbortController();
    
    // Store the abort function for potential cancellation
    this.pendingRequests.set(request.id, () => {
      abortController.abort();
      this.activeRequests--;
      // Use setTimeout to break the call stack and prevent stack overflow
      setTimeout(() => this.processQueue(), 0);
    });

    try {
      const result = await this.withTimeout(
        request.promise(),
        30000, // 30 second timeout
        abortController
      );
      
      request.resolve(result);
    } catch (error) {
      if (!abortController.signal.aborted) {
        request.reject(error);
      }
    } finally {
      this.pendingRequests.delete(request.id);
      this.activeRequests--;
      // Use setTimeout to break the call stack and prevent stack overflow
      setTimeout(() => this.processQueue(), 0);
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    abortController: AbortController
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        abortController.abort();
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);

      // Check if the abort controller was already triggered before awaiting
      if (abortController.signal.aborted) {
        clearTimeout(timeoutId);
        reject(new Error('Request was aborted before execution'));
        return;
      }

      promise
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          if (!abortController.signal.aborted) {
            reject(error);
          } else {
            reject(new Error('Request was aborted during execution'));
          }
        });
    });
  }

  get queueSize(): number {
    return this.queue.length;
  }

  get activeCount(): number {
    return this.activeRequests;
  }

  clear(): void {
    // Reject all pending requests in the queue
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        request.reject(new Error('Request queue was cleared'));
      }
    }
    
    // Cancel all active requests
    this.pendingRequests.forEach(cancel => cancel());
    this.pendingRequests.clear();
  }
}

// Global request queue instance
export const requestQueue = new RequestQueue();

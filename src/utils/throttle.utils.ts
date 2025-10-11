// utils/throttle.utils.ts - Request throttling utilities
// A comment to trigger re-compilation

/**
 * RequestThrottler class to manage API request rate limiting
 */
export class RequestThrottler {
  private queue: Array<() => Promise<unknown>> = [];
  private lastRequestTime: number = 0;
  private minInterval: number;

  constructor(minInterval: number = 1000) {
    // Increased from 500ms to 1000ms (1 second)
    this.minInterval = minInterval;
  }

  /**
   * Adds a request to the queue and executes it with rate limiting
   */
  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          console.error('Throttled request failed:', error);
          reject(error);
        }
      });

      if (this.queue.length === 1) {
        this.processQueue();
      }
    });
  }

  /**
   * Processes the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minInterval) {
      // Need to wait before processing next request
      const waitTime = this.minInterval - timeSinceLastRequest;
      setTimeout(() => {
        this.executeNext();
      }, waitTime);
    } else {
      this.executeNext();
    }
  }

  /**
   * Executes the next request in the queue
   */
  private async executeNext(): Promise<void> {
    if (this.queue.length === 0) return;

    const requestFn = this.queue.shift()!;
    this.lastRequestTime = Date.now();

    try {
      await requestFn();
    } catch (error) {
      console.error('Request failed in throttler:', error);
    }

    // Process next request
    this.processQueue();
  }

  /**
   * Clears the request queue
   */
  clear(): void {
    this.queue = [];
  }
}

// Create a global throttler instance with a more conservative rate limit
export const apiThrottler = new RequestThrottler(1000); // 1 second between requests

const exponentialBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 3, // Reduced retries from 5 to 3
  delay = 2000 // Increased initial delay from 1000ms to 2000ms
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return exponentialBackoff(fn, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
};

/**
 * Delays execution for a specified time
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export default exponentialBackoff;

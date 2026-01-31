import { ActionResponse } from "@/types/action-response";

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry a server action with exponential backoff
 * Useful for handling Vercel cold starts and temporary failures
 */
export async function retryAction<T>(
  action: () => Promise<ActionResponse<T>>,
  options: RetryOptions = {}
): Promise<ActionResponse<T>> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await action();
      
      // If action succeeded, return the result
      if (result.success) {
        return result;
      }
      
      // If it's the last attempt or error is not retryable, return the error
      if (attempt === maxRetries || !isRetryableError(result.error)) {
        return result;
      }
      
      lastError = result.error;
    } catch (error) {
      lastError = error;
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        return {
          success: false,
          error: "Service temporarily unavailable. Please try again.",
        } as ActionResponse<T>;
      }
      
      // If error is not retryable, throw immediately
      if (!isRetryableError(error)) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "An error occurred",
        } as ActionResponse<T>;
      }
    }
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      initialDelay * Math.pow(backoffMultiplier, attempt),
      maxDelay
    );
    
    // Call onRetry callback if provided
    if (onRetry) {
      onRetry(attempt + 1, lastError);
    }
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // This should never be reached, but just in case
  return {
    success: false,
    error: "Maximum retries exceeded. Please try again later.",
  } as ActionResponse<T>;
}

/**
 * Check if an error is retryable (cold start, timeout, network issues)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const errorString = typeof error === 'string' 
    ? error.toLowerCase() 
    : error.message?.toLowerCase() || '';
  
  // Common cold start and network error patterns
  const retryablePatterns = [
    'timeout',
    'timed out',
    'econnrefused',
    'enotfound',
    'network',
    'connection',
    'temporarily unavailable',
    'service unavailable',
    'internal server error',
    'gateway timeout',
    'bad gateway',
    '502',
    '503',
    '504',
  ];
  
  return retryablePatterns.some(pattern => errorString.includes(pattern));
}

/**
 * Wrapper for async operations with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

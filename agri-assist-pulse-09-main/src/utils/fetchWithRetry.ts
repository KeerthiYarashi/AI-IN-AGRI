/**
 * Fetch with retry logic and exponential backoff
 * Includes timeout handling and circuit breaker pattern
 */

interface RetryOptions {
  maxAttempts?: number;
  timeout?: number;
  backoffMultiplier?: number;
  initialDelay?: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuitBreakers: Map<string, CircuitBreakerState> = new Map();
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxAttempts = 3,
    timeout = 10000, // Increased timeout for Vercel
    backoffMultiplier = 2,
    initialDelay = 500 // Increased initial delay
  } = retryOptions;

  // Check circuit breaker
  const circuitKey = new URL(url).hostname;
  const circuit = circuitBreakers.get(circuitKey);
  
  if (circuit?.isOpen) {
    const timeSinceFailure = Date.now() - circuit.lastFailure;
    if (timeSinceFailure < CIRCUIT_BREAKER_TIMEOUT) {
      throw new Error(`Circuit breaker open for ${circuitKey}. Try again later.`);
    } else {
      // Reset circuit breaker
      circuit.isOpen = false;
      circuit.failures = 0;
    }
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxAttempts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'User-Agent': 'AI-Agri-Assistant/1.0',
        }
      });

      clearTimeout(timeoutId);

      // Handle specific Vercel error codes
      if (response.status === 504) {
        throw new Error('Gateway timeout - service temporarily unavailable');
      }
      if (response.status === 502) {
        throw new Error('Bad gateway - service configuration error');
      }
      if (response.status === 503) {
        throw new Error('Service unavailable - please try again later');
      }

      if (!response.ok && response.status < 500) {
        // Don't retry client errors
        return response;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Reset circuit breaker on success
      if (circuit) {
        circuit.failures = 0;
        circuit.isOpen = false;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      attempt++;

      // Track failures for circuit breaker
      if (!circuit) {
        circuitBreakers.set(circuitKey, {
          failures: 1,
          lastFailure: Date.now(),
          isOpen: false
        });
      } else {
        circuit.failures++;
        circuit.lastFailure = Date.now();
        
        if (circuit.failures >= CIRCUIT_BREAKER_THRESHOLD) {
          circuit.isOpen = true;
          console.warn(`🚨 Circuit breaker opened for ${circuitKey}`);
        }
      }

      if (attempt >= maxAttempts) {
        throw lastError;
      }

      const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt - 1), 5000);
      console.warn(`⚠️ Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}

export function resetCircuitBreaker(hostname: string): void {
  circuitBreakers.delete(hostname);
}

export function getCircuitBreakerStatus(hostname: string): CircuitBreakerState | null {
  return circuitBreakers.get(hostname) || null;
}

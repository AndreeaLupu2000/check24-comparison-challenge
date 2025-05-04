// src/controllers/utils/retry.ts
import { NonRetryableError } from './errors';

/**
 * Retry a function with a timeout
 * @param fn - The function to retry
 * @param retries - The number of retries
 * @param timeoutMs - The timeout in milliseconds
 * @returns The result of the function
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  retries = 3,
  timeoutMs = 30000 // 30 seconds
): Promise<T> {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    console.log(`[retryWithTimeout] Attempt ${attempt + 1} of ${retries}`);
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs)
        )
      ]);
    } catch (err: any) {
      lastError = err;

      if (err instanceof NonRetryableError) {
        console.warn(`[retryWithTimeout] Skipping retry: ${err.name} - ${err.message}`);
        break; // no more retries
      }
    }
  }

  throw lastError;
}

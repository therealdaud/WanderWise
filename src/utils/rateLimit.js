// src/utils/rateLimit.js
// Helpers to avoid hitting RapidAPI rate limits on free-tier plans

/** Wait for a given number of milliseconds */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run an async function with automatic retry on 429 (rate-limit) responses.
 * Uses exponential back-off: 3 s, 6 s, 12 s …
 */
export async function withRetry(fn, maxRetries = 3, baseDelayMs = 3000) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const is429 = err.response?.status === 429;
      if (is429 && attempt < maxRetries) {
        const wait = baseDelayMs * Math.pow(2, attempt); // 3 s, 6 s, 12 s
        console.warn(`429 received – retrying in ${wait / 1000}s…`);
        await delay(wait);
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

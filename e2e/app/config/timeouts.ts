/**
 * Centralised timeout constants for Playwright tests.
 */
export const TIMEOUTS = {
  /** Default assertion timeout (toBeVisible, toHaveText, etc.) */
  DEFAULT: 10_000,

  /** Page / URL navigation timeout */
  NAVIGATION: 15_000,

  /** Longer wait for slow operations (auth, heavy data fetches) */
  SLOW: 30_000,
} as const;

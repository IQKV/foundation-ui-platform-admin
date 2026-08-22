import { defineConfig, devices } from "@playwright/test";
import { config as loadDotenv } from "dotenv";
import { resolve } from "path";

// Load .env.e2e before anything else so BASE_URL and E2E_* vars are available.
// Variables already set in the environment (e.g. CI secrets) are NOT overridden.
loadDotenv({ path: resolve(process.cwd(), ".env.e2e"), override: false });

// ─── Resolve target URL ───────────────────────────────────────────────────────
// Priority: BASE_URL env var → .env.e2e BASE_URL → local dev server fallback.
const port = process.env["PORT"] ?? "5173";
const baseURL = process.env["BASE_URL"] ?? `http://localhost:${port}`;

const isCI = Boolean(process.env["CI"]);

/**
 * When BASE_URL points at a remote host (https://) we skip the local dev
 * server entirely — there is nothing to start.
 */
const isRemote =
  baseURL.startsWith("https://") ||
  (baseURL.startsWith("http://") &&
    !baseURL.includes("localhost") &&
    !baseURL.includes("127.0.0.1"));

export default defineConfig({
  forbidOnly: isCI,
  fullyParallel: !isCI,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  globalSetup: "./e2e/app/setup/global-setup.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    ...(isCI || process.env["ALL_BROWSERS"]
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),
  ],
  reporter: [["html", { open: "never" }], ["list"], ...(isCI ? ([["github"]] as const) : [])],
  retries: isCI ? 2 : 1,
  testDir: "./e2e",
  outputDir: "./.playwright/test-results",
  snapshotDir: "./.playwright/snapshots",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  // Only spin up the local dev server when targeting localhost.
  // When BASE_URL is a remote https:// host the app is already running.
  ...(!isRemote && {
    webServer: {
      command: "pnpm dev",
      url: baseURL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
      stdout: "ignore",
      stderr: "pipe",
    },
  }),
  workers: isCI ? 1 : undefined,
});

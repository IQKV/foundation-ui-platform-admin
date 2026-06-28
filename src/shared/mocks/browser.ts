import { setupWorker } from "msw/browser";
import { handlers } from "./handlers/index";

/**
 * MSW browser worker for development.
 *
 * Started in main.tsx when VITE_ENABLE_MSW=true:
 *   const { worker } = await import("@/shared/mocks/browser");
 *   await worker.start({ onUnhandledRequest: "warn" });
 */
export const worker = setupWorker(...handlers);

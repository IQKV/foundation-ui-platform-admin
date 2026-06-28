import { setupServer } from "msw/node";
import { handlers } from "./handlers/index";

/**
 * MSW Node server for Vitest unit tests.
 *
 * Wired up in src/setupTests.ts:
 *   beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */
export const server = setupServer(...handlers);

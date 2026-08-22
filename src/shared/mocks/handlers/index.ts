import { authHandlers } from "./auth.handlers";
import { iamHandlers } from "./iam.handlers";

/**
 * Combined MSW handler list — auth first so login endpoints
 * aren't accidentally caught by broader patterns.
 */
export const handlers = [...authHandlers, ...iamHandlers];

import { http, HttpResponse } from "msw";
import { MOCK_SIGN_IN_RESPONSE } from "../data/admin";

export const authHandlers = [
  // POST /v1/iam/auth/admin/signin — platform admin credential exchange
  http.post("*/v1/iam/auth/admin/signin", () => {
    return HttpResponse.json(MOCK_SIGN_IN_RESPONSE, { status: 200 });
  }),

  // POST /v1/iam/auth/admin/refresh — silent token refresh
  http.post("*/v1/iam/auth/admin/refresh", () => {
    return HttpResponse.json(MOCK_SIGN_IN_RESPONSE, { status: 200 });
  }),

  // POST /v1/iam/auth/signout
  http.post("*/v1/iam/auth/signout", () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

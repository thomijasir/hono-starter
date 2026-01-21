import type { LoginPayload, RegisterPayload } from "./model";
import * as authService from "./service";

import { createJsonHandler, createHandler } from "~/utils";

export const login = createJsonHandler<LoginPayload>(
  async ({ body, state, httpResponse, errorResponse }) => {
    const result = await authService.login(state, body);

    if (result.ok) {
      return httpResponse(result.val.token, "Login successful");
    }

    const error = result.val;
    return errorResponse(error.message, 500);
  },
);

export const register = createJsonHandler<RegisterPayload>(
  async ({ body, state, httpResponse }) => {
    const payload = body;
    const token = await authService.register(state, payload);
    return httpResponse(token, "Registration successful", 201);
  },
);

export const logout = createHandler(({ httpResponse }) => {
  // await authService.logout(state);
  return httpResponse(null, "Logout successful");
});

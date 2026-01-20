import type { LoginPayload, RegisterPayload } from "./model";
import * as authService from "./service";

import { createHandler } from "~/utils";

export const login = createHandler<LoginPayload>(
  async ({ body, state, httpResponse }) => {
    const payload = body;
    const token = await authService.login(state, payload);
    return httpResponse(token, "Login successful");
  },
);

export const register = createHandler<RegisterPayload>(
  async ({ body, state, httpResponse }) => {
    const payload = body;
    const token = await authService.register(state, payload);
    return httpResponse(token, "Registration successful", 201);
  },
);

export const logout = createHandler(({ httpResponse } ) => {
  // await authService.logout(state);
  return httpResponse(null, "Logout successful");
});
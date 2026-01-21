import { sign } from "hono/jwt";
import { findUserByEmail } from "../user/repository";
import type { LoginPayload, RegisterPayload } from "./model";
import * as authService from "./service";

import { createJsonHandler, createHandler, verifyPassword } from "~/utils";

export const login = createJsonHandler<LoginPayload>(
  async ({ body, state, httpResponse, errorResponse }) => {
    const [userErr, userRes] = await findUserByEmail(state, body.email);
    if (userErr) {
      return errorResponse(userErr, 500);
    }
    if (!userRes) {
      return errorResponse("Invalid email or password", 401);
    }
    const [_, match] = await verifyPassword(body.password, userRes.password);
    if (!match) {
      return errorResponse("Invalid email or password", 401);
    }
    const token = await sign(
      {
        id: userRes.id,
        email: userRes.email,
        name: userRes.name,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
      },
      state.config.jwtSecret,
    );
    return httpResponse({ token }, "Login successful");
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

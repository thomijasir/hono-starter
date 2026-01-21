import { findUserByEmail } from "../user/repository";
import type { LoginPayload, RegisterPayload } from "./model";
import { signToken } from "./service";
import { createJsonHandler, createHandler, verifyPassword } from "~/utils";

export const login = createJsonHandler<LoginPayload>(
  async ({ body, state, httpResponse, errorResponse }) => {
    const userResult = await findUserByEmail(state, body.email);
    if (!userResult.ok) {
      return errorResponse(userResult.err, 500);
    }
    const user = userResult.val;
    const matchResult = await verifyPassword(body.password, user.password);
    if (!matchResult.ok || !matchResult.val) {
      return errorResponse("Invalid email or password", 401);
    }
    const token = await signToken(user, state.config.jwtSecret);
    if (!token.ok) {
      return errorResponse(token.err, 500);
    }
    return httpResponse({ token }, "Login successful");
  },
);

export const register = createJsonHandler<RegisterPayload>(
  async ({ body, state, httpResponse }) => {
    return httpResponse(token, "Registration successful", 201);
  },
);

export const logout = createHandler(({ httpResponse }) => {
  // await authService.logout(state);
  return httpResponse(null, "Logout successful");
});

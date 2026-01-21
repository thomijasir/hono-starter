import { err, ok } from "neverthrow";
import { createNewUser, findUserByEmail } from "../user/repository";
import type { LoginPayload, RegisterPayload } from "./model";
import { signToken } from "./service";
import { UserAlreadyExistsError } from "~/model";
import {
  createHandler,
  createJsonHandler,
  hashPassword,
  verifyPassword,
} from "~/utils";

// Pipe handle method (recommend for simple operation and most cases)
export const register = createJsonHandler<RegisterPayload>(
  ({ body, state, httpResponse, errorResponse }) => {
    return findUserByEmail(state, body.email)
      .andThen((user) =>
        user ? err(new UserAlreadyExistsError(user.email)) : ok(body.password),
      )
      .andThen((password) => hashPassword(password))
      .andThen((hashedPassword) =>
        createNewUser(state, { ...body, password: hashedPassword }),
      )
      .match(
        (user) => httpResponse(user, "Registration successful", 201),
        (error) =>
          errorResponse(
            error.message,
            error instanceof UserAlreadyExistsError ? 409 : 500,
            error,
          ),
      );
  },
);

// Standard handle (recommend for complex operation)
export const login = createJsonHandler<LoginPayload>(
  async ({ body, state, httpResponse, errorResponse }) => {
    // Check User in Database
    const result = await findUserByEmail(state, body.email);
    if (result.isErr()) {
      return errorResponse(result.error.message, 500);
    }
    const user = result.value;
    if (!user) {
      return errorResponse("user not found", 500);
    }
    // check user password
    const match = await verifyPassword(body.password, user.password);
    if (match.isErr()) {
      return errorResponse("unable to verify password", 500);
    }
    if (!match.value) {
      return errorResponse("username or password wrong", 500);
    }
    // Create signature token
    const payload = {
      id: user.id,
      email: user.email,
      name: user.email,
    };
    const sign = await signToken(payload, state.config.jwtSecret);
    if (sign.isErr()) {
      return errorResponse("unable to create token", 500);
    }
    return httpResponse({ token: sign.value });
  },
);

export const logout = createHandler(({ httpResponse }) => {
  // await authService.logout(state);
  return httpResponse(null, "Logout successful");
});

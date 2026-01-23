import { findUserByEmail, saveNewUser } from "../user/repository";
import type { LoginPayload, RegisterPayload, AuthResponse } from "./model";
import { signToken } from "./service";
import type { UserModel } from "~/schemas/default";
import {
  createJsonHandler,
  createHandler,
  verifyPassword,
  passwordHash,
  Result,
  Ok,
  Err,
} from "~/utils";

// Pipe handle method (recommend for simple operation and most cases)
export const login = createJsonHandler<LoginPayload, AuthResponse>(
  async (props) => {
    const { body, state, httpResponse, errorResponse } = props;
    const chainResult = await Result.chain(
      findUserByEmail(state, body.email),
      async (user: UserModel) => {
        const matchResult = await verifyPassword(body.password, user.password);
        if (!matchResult.ok || !matchResult.val) {
          return Err("invalid email or password");
        }
        return Ok(user);
      },
      (user: UserModel) => signToken(user, state.config.jwtSecret),
    );

    if (!chainResult.ok) {
      return errorResponse(chainResult.err);
    }

    return httpResponse({ token: chainResult.val }, "login successful");
  },
);

// Standard handle (recommend for complex operation)
export const register = createJsonHandler<RegisterPayload, AuthResponse>(
  async ({ body, state, httpResponse, errorResponse }) => {
    const userResult = await findUserByEmail(state, body.email);
    if (userResult.ok) {
      return errorResponse("user already exist");
    }

    const createPassword = await passwordHash(body.password);
    if (!createPassword.ok) {
      return errorResponse("failed hashing password");
    }

    const resultCreateUser = await saveNewUser(state, {
      ...body,
      password: createPassword.val,
    });

    if (!resultCreateUser.ok) {
      return errorResponse(resultCreateUser.err);
    }
    const newUser = resultCreateUser.val;
    const token = await signToken(newUser, state.config.jwtSecret);
    if (!token.ok) {
      return errorResponse(token.err);
    }
    return httpResponse({ token: token.val }, "registration successful", 201);
  },
);

export const logout = createHandler(({ httpResponse }) => {
  return httpResponse(null, "logout successful");
});

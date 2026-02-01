import type { JWTAuthDataType } from "../auth/model";
import { findAllUsers, findUserByID } from "./repository";
import { createHandler } from "~/utils";

export const getAllUsers = createHandler(
  async ({ state, httpResponse, errorResponse }) => {
    const users = await findAllUsers(state);
    if (!users.ok) {
      return errorResponse(users.err);
    }
    const safeUsers = users.val.map(({ password: _password, ...user }) => user);
    return httpResponse(safeUsers);
  },
);

export const getUser = createHandler(
  async ({ state, params, httpResponse, errorResponse }) => {
    const user = await findUserByID(state, params.id ?? "");

    if (!user.ok) {
      return errorResponse(user.err, 404);
    }

    const { password: _password, ...safeUser } = user.val;
    return httpResponse(safeUser);
  },
);

export const getMyProfile = createHandler<object, JWTAuthDataType>(
  ({ httpResponse, claim }) => {
    return httpResponse(claim as object);
  },
);

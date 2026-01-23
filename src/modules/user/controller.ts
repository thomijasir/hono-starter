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
    const id = Number(params.id);
    const user = await findUserByID(state, id);

    if (!user.ok) {
      return errorResponse(user.err, 404);
    }

    const { password: _password, ...safeUser } = user.val;
    return httpResponse(safeUser);
  },
);

export const getMyProfile = createHandler<object, { id: number }>(
  ({ httpResponse, claim }) => {
    return httpResponse(claim as object);
  },
);

import * as userService from "./service";
import { createHandler } from "~/utils";

export const getAllUsers = createHandler(
  async ({ state, httpResponse }) => {
    const users = await userService.getUsers(state);
    return httpResponse(users);
  },
);

export const getUser = createHandler(
  async ({ state, params, httpResponse, errorResponse }) => {
    const id = Number(params.id);
    const user = await userService.getUserById(state, id);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return httpResponse(user);
  },
);

export const getMyProfile = createHandler<{ id: number }>(
  ({ httpResponse, claim }) => {
    return httpResponse(claim);
  },
);

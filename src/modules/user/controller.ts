import * as userService from "./service";
import type { HandlerContext } from "~/model";
import { createHandler } from "~/utils";

export const getAllUsers = createHandler(
  async ({ state, httpResponse }: HandlerContext) => {
    const users = await userService.getUsers(state);
    return httpResponse(users);
  },
);

export const getUser = createHandler(
  async ({ state, params, httpResponse, errorResponse }: HandlerContext) => {
    const id = Number(params.id);
    const user = await userService.getUserById(state, id);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return httpResponse(user);
  },
);

export const getMyProfile = createHandler(
  ({ ctx, httpResponse }: HandlerContext) => {
    const payload = ctx.var.jwtPayload as Record<string, string>;
    return httpResponse(payload);
  },
);

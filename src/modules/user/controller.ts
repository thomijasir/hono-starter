import * as userService from "./service";
import type { HandlerContext } from "~/model";
import { createHandler } from "~/utils";

export const getAllUsers = createHandler(
  ({ state, httpResponse }: HandlerContext) => {
    const posts = userService.getUsers(state);
    return httpResponse(posts);
  },
);

export const getUser = createHandler(
  ({ params, httpResponse, errorResponse }: HandlerContext) => {
    const id = Number(params.id);
    const user = userService.getUserById(id);

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

import type { Context } from "hono";
import * as userService from "./service";
import type { Variables } from "~/model";
import { httpResponse, errorResponse } from "~/utils";

export const getAllUsers = async (c: Context<{ Variables: Variables }>) => {
  const state = c.get("state");
  
  // Simulate a DB query
  await state.db.query("SELECT * FROM users");

  const users = userService.getUsers();
  return httpResponse(c, users);
};

export const getUser = (c: Context) => {
  const id = Number(c.req.param("id"));
  const user = userService.getUserById(id);

  if (!user) {
    return errorResponse(c, "User not found", 404);
  }

  return httpResponse(c, user);
};

export const getMyProfile = (c: Context<{ Variables: Variables }>) => {
  const payload = c.get("jwtPayload") as { sub: string };
  return httpResponse(c, payload);
};

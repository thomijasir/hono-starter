import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import * as userController from "./controller";
import { GetUserParamSchema } from "./model";
import { auth } from "~/middlewares";
import type { Variables } from "~/model";

const routes = new Hono<{ Variables: Variables }>();

routes.get("/", userController.getAllUsers);
routes.get("/myinfo", auth, userController.getMyProfile);
routes.get(
  "/:id",
  zValidator("param", GetUserParamSchema),
  userController.getUser,
);

export { routes as userRoutes };

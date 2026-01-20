
import { Hono } from "hono";
import * as controller from "./controller";
import { GetUserParamSchema } from "./model";
import { auth, validator } from "~/middlewares";
import type { Variables } from "~/model";

const routes = new Hono<{ Variables: Variables }>();

routes.get("/", controller.getAllUsers);
routes.get("/myinfo", auth, controller.getMyProfile);
routes.get(
  "/:id",
  auth,
  validator("param", GetUserParamSchema),
  controller.getUser,
);  

export { routes as userRoutes };

import { Hono } from "hono";
import type { Variables } from "hono/types";
import * as controller from "./controller";
import { LoginSchema, RegisterSchema } from "./model";
import { validator } from "~/middlewares";

export const authRoutes = () => {
  const routes = new Hono<{ Variables: Variables }>();
  routes.post("/login", validator("json", LoginSchema), controller.login);
  routes.post(
    "/register",
    validator("json", RegisterSchema),
    controller.register,
  );
  return routes;
};

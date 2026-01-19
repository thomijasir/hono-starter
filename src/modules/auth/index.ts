
import { Hono } from "hono";
import type { Variables } from "hono/types";
import * as loginController from "./controller"
import { LoginSchema, RegisterSchema } from "./model";
import { validator } from "~/middlewares";

const routes = new Hono<{ Variables: Variables }>();

routes.post("/login", validator("json", LoginSchema), loginController.login);
routes.post("/register", validator("json", RegisterSchema), loginController.register);

export { routes as authRoutes };
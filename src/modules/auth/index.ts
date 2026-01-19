import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Variables } from "hono/types";
import * as loginController from "./controller"
import { LoginSchema, RegisterSchema } from "./model";

const routes = new Hono<{ Variables: Variables }>();

routes.post("/login", zValidator("json", LoginSchema), loginController.login);
routes.post("/register", zValidator("json", RegisterSchema), loginController.register);

export { routes as authRoutes };
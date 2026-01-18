import { Hono } from "hono";
import * as postController from "./controller";

const routes = new Hono();

routes.get("/", postController.getAllPosts);
routes.get("/:id", postController.getPost);

export { routes as postRoutes };

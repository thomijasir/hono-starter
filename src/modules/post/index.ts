import { Hono } from "hono";
import * as controller from "./controller";
import { CreatePostSchema, UpdatePostSchema } from "./model";
import { auth, validator } from "~/middlewares";
import type { Variables } from "~/model";

export const postRoutes = () => {
  const routes = new Hono<{ Variables: Variables }>();

  routes.get("/", controller.getAllPosts);
  routes.get("/:id", controller.getPost);
  routes.post(
    "/",
    auth,
    validator("json", CreatePostSchema),
    controller.createPost,
  );
  routes.patch(
    "/:id",
    auth,
    validator("json", UpdatePostSchema),
    controller.updatePost,
  );
  routes.delete("/:id", auth, controller.deletePost);
  return routes;
};

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import * as postController from "./controller";
import { CreatePostSchema, UpdatePostSchema } from "./model";
import { auth } from "~/middlewares";
import type { Variables } from "~/model";

const routes = new Hono<{ Variables: Variables }>();

routes.get("/", postController.getAllPosts);
routes.get("/:id", postController.getPost);
routes.post(
  "/",
  auth,
  zValidator("json", CreatePostSchema),
  postController.createPost,
);
routes.patch(
  "/:id",
  auth,
  zValidator("json", UpdatePostSchema),
  postController.updatePost,
);
routes.delete("/:id", auth, postController.deletePost);

export { routes as postRoutes };

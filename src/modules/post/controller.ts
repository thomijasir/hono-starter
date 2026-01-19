import { Hono } from "hono";
import type { z } from "zod";
import { CreatePostSchema, UpdatePostSchema } from "./model";
import * as postService from "./service";
import { auth, validator } from "~/middlewares";
import type { HandlerContext, Variables } from "~/model";
import { createHandler } from "~/utils";

export const getAllPosts = createHandler(
  async ({ state, httpResponse }: HandlerContext) => {
    const posts = await postService.getPosts(state);
    return httpResponse(posts);
  },
);

export const getPost = createHandler(
  async ({ state, params, httpResponse, errorResponse }: HandlerContext) => {
    const id = Number(params.id);
    const post = await postService.getPostById(state, id);

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    return httpResponse(post);
  },
);

export const createPost = createHandler(
  async ({ ctx, state, body, httpResponse }: HandlerContext) => {
    // We can safely cast body because of the zValidator middleware
    const payload = body as z.infer<typeof CreatePostSchema>;
    const jwtPayload = ctx.var.jwtPayload as { id: number };

    const post = await postService.createPost(state, jwtPayload.id, payload);
    return httpResponse(post, "Post created successfully", 201);
  },
);

export const updatePost = createHandler(
  async ({
    ctx,
    state,
    params,
    body,
    httpResponse,
    errorResponse,
  }: HandlerContext) => {
    const id = Number(params.id);
    const jwtPayload = ctx.var.jwtPayload as { id: number };

    // Check if post exists
    const existingPost = await postService.getPostById(state, id);
    if (!existingPost) {
      return errorResponse("Post not found", 404);
    }

    // Check ownership
    if (existingPost.authorId !== jwtPayload.id) {
      return errorResponse("Forbidden", 403);
    }

    const payload = body as z.infer<typeof UpdatePostSchema>;
    const post = await postService.updatePost(state, id, payload);

    return httpResponse(post, "Post updated successfully");
  },
);

export const deletePost = createHandler(
  async ({
    ctx,
    state,
    params,
    httpResponse,
    errorResponse,
  }: HandlerContext) => {
    const id = Number(params.id);
    const jwtPayload = ctx.var.jwtPayload as { id: number };

    // Check if post exists
    const existingPost = await postService.getPostById(state, id);
    if (!existingPost) {
      return errorResponse("Post not found", 404);
    }

    // Check ownership
    if (existingPost.authorId !== jwtPayload.id) {
      return errorResponse("Forbidden", 403);
    }

    await postService.deletePost(state, id);
    return httpResponse(null, "Post deleted successfully");
  },
);

const routes = new Hono<{ Variables: Variables }>();

routes.get("/", getAllPosts);
routes.get("/:id", getPost);
routes.post("/", auth, validator("json", CreatePostSchema), createPost);
routes.patch("/:id", auth, validator("json", UpdatePostSchema), updatePost);
routes.delete("/:id", auth, deletePost);

export { routes as postRoutes };

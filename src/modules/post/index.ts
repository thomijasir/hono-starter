import { z } from "zod";
import * as controller from "./controller";
import {
  CreatePostSchema,
  GetPostParamSchema,
  GetPostsQuerySchema,
  PostSchema,
  UpdatePostSchema,
} from "./model";
import { auth } from "~/middlewares";
import {
  createResponses,
  createRouter,
  createRoute,
  jsonRequest,
  jsonResponseSchema,
} from "~/utils";

export const postRoutes = () => {
  const postResponseSchema = jsonResponseSchema(PostSchema);
  const postListResponseSchema = jsonResponseSchema(z.array(PostSchema));
  return createRouter()
    .openapi(
      createRoute({
        method: "get",
        path: "/",
        request: {
          query: GetPostsQuerySchema,
        },
        responses: createResponses(
          postListResponseSchema,
          "Get all posts",
          200,
        ),
        tags: ["Post"],
      }),
      controller.getAllPosts,
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/{id}",
        request: {
          params: GetPostParamSchema,
        },
        responses: createResponses(postResponseSchema, "Get post by id", 200, {
          404: {
            description: "Post not found",
          },
        }),
        tags: ["Post"],
      }),
      controller.getPost,
    )
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        middleware: [auth] as const,
        request: jsonRequest(CreatePostSchema),
        responses: createResponses(postResponseSchema, "Create post", 201, {
          401: {
            description: "Unauthorized",
          },
        }),
        tags: ["Post"],
        security: [{ Bearer: [] }],
      }),
      controller.createPost,
    )
    .openapi(
      createRoute({
        method: "patch",
        path: "/{id}",
        middleware: [auth],
        request: {
          params: GetPostParamSchema,
          body: jsonRequest(UpdatePostSchema).body,
        },
        responses: createResponses(postResponseSchema, "Update post", 200, {
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Forbidden",
          },
          404: {
            description: "Post not found",
          },
        }),
        tags: ["Post"],
        security: [{ Bearer: [] }],
      }),
      controller.updatePost,
    )
    .openapi(
      createRoute({
        method: "delete",
        path: "/{id}",
        middleware: [auth] as const,
        request: {
          params: GetPostParamSchema,
        },
        responses: createResponses(
          jsonResponseSchema(z.null()),
          "Delete post",
          200,
          {
            401: {
              description: "Unauthorized",
            },
            403: {
              description: "Forbidden",
            },
            404: {
              description: "Post not found",
            },
          },
        ),
        tags: ["Post"],
        security: [{ Bearer: [] }],
      }),
      controller.deletePost,
    );
};

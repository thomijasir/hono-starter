import type { CreatePostPayload, UpdatePostPayload } from "./model";
import * as postService from "./service";
import { createHandler } from "~/utils";

export const getAllPosts = createHandler(
  async ({ query, state, httpResponse }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const { posts, total } = await postService.getPosts(state, page, limit);
    return httpResponse(posts, "Posts fetched successfully", 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  },
);

export const getPost = createHandler(
  async ({ state, params, httpResponse, errorResponse }) => {
    const id = Number(params.id);
    const post = await postService.getPostById(state, id);
    if (!post) {
      return errorResponse("Post not found", 404);
    }
    return httpResponse(post);
  },
);

export const createPost = createHandler<CreatePostPayload, { id: number }>(
  async ({ state, body, claim, httpResponse, errorResponse }) => {
    if (!claim) {
      return errorResponse("Unauthorized", 401);
    }
    const post = await postService.createPost(state, claim.id, body);
    return httpResponse(post, "Post created successfully", 201);
  },
);

export const updatePost = createHandler<UpdatePostPayload, { id: number }>(
  async ({
    state,
    params,
    body,
    claim,
    httpResponse,
    errorResponse,
  }) => {
    const id = Number(params.id);
    // Check if post exists
    const existingPost = await postService.getPostById(state, id);
    if (!existingPost) {
      return errorResponse("Post not found", 404);
    }

    // Check ownership
    if (!claim) {
      return errorResponse("Unauthorized", 401);
    }
    if (existingPost.authorId !== claim.id) {
      return errorResponse("Forbidden", 403);
    }

    const post = await postService.updatePost(state, id, body);

    return httpResponse(post, "Post updated successfully");
  },
);

export const deletePost = createHandler<null, { id: number }>(
  async ({
    state,
    params,
    claim,
    httpResponse,
    errorResponse,
  }) => {
    const id = Number(params.id);

    // Check if post exists
    const existingPost = await postService.getPostById(state, id);
    if (!existingPost) {
      return errorResponse("Post not found", 404);
    }

    // Check ownership
    if (!claim) {
      return errorResponse("Unauthorized", 401);
    }
    if (existingPost.authorId !== claim.id) {
      return errorResponse("Forbidden", 403);
    }

    await postService.deletePost(state, id);
    return httpResponse(null, "Post deleted successfully");
  },
);

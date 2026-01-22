import type { CreatePostPayload, UpdatePostPayload } from "./model";
import { 
  saveNewPost, 
  deletePostById, 
  findPostById, 
  savePost,
  findAllPosts
} from "./repository";
import type { PostModel } from "~/schemas/default";
import { createHandler, createJsonHandler, Ok, Result } from "~/utils";

export const getAllPosts = createHandler(
  async ({ query, state, httpResponse, errorResponse }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    
    const result = await findAllPosts(state, page, limit);
    
    if (!result.ok) {
      return errorResponse(result.err);
    }

    const { posts, total } = result.val;
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
    const postResult = await findPostById(state, id);
    
    if (!postResult.ok) {
      return errorResponse(postResult.err, 404);
    }
    
    return httpResponse(postResult.val);
  },
);

export const createPost = createJsonHandler<CreatePostPayload, { id: number }>(
  async ({ state, body, claim, httpResponse, errorResponse }) => {
    if (!claim) {
      return errorResponse("Unauthorized", 401);
    }
    
    const postResult = await saveNewPost(state, claim.id, body);
    
    if (!postResult.ok) {
      return errorResponse(postResult.err);
    }

    return httpResponse(postResult.val, "Post created successfully", 201);
  },
);

export const updatePost = createJsonHandler<UpdatePostPayload, { id: number }>(
  async ({
    state,
    params,
    body,
    claim,
    httpResponse,
    errorResponse,
  }) => {
    const id = Number(params.id);
    
    const chainResult = await Result.chain(
      findPostById(state, id),
      (existingPost: PostModel) => {
        if (!claim) {
          // This should ideally be caught by middleware, but for safety in logic flow
          return { ok: false, err: "Unauthorized" }; 
        }
        if (existingPost.authorId !== claim.id) {
          return { ok: false, err: "Forbidden" };
        }
        return Ok(existingPost);
      },
      () => savePost(state, id, body)
    );

    if (!chainResult.ok) {
      return errorResponse(chainResult.err);
    }

    return httpResponse(chainResult.val, "Post updated successfully");
  },
);

export const deletePost = createHandler<{ id: number }>(
  async ({
    state,
    params,
    claim,
    httpResponse,
    errorResponse,
  }) => {
    const id = Number(params.id);

    const chainResult = await Result.chain(
      findPostById(state, id),
      (existingPost: PostModel) => {
        if (!claim) {
           return { ok: false, err: "Unauthorized" };
        }
        if (existingPost.authorId !== claim.id) {
          return { ok: false, err: "Forbidden" };
        }
        return Ok(existingPost);
      },
      () => deletePostById(state, id)
    );

    if (!chainResult.ok) {
      return errorResponse(chainResult.err);
    }

    return httpResponse(null, "Post deleted successfully");
  },
);

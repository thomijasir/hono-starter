import * as postService from "./service";
import type { HandlerContext } from "~/model";
import { createHandler } from "~/utils";

export const getAllPosts = createHandler(({ httpResponse }: HandlerContext) => {
  const posts = postService.getPosts();
  return httpResponse(posts);
});

export const getPost = createHandler(
  ({ params, httpResponse, errorResponse }: HandlerContext) => {
    const id = Number(params.id);
    const post = postService.getPostById(id);

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    return httpResponse(post);
  },
);

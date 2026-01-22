import { eq, sql } from "drizzle-orm";
import type { CreatePostPayload, UpdatePostPayload } from "./model";
import type { AppState } from "~/model";
import type { PostModel } from "~/schemas/default";
import { posts } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result } from "~/utils";

export const findAllPosts = async (
  state: AppState,
  page: number = 1,
  limit: number = 10,
): Promise<ResultType<{ posts: PostModel[]; total: number }, string>> => {
  const { db } = state;

  const datasetResult = await Result.async(
    db
      .select()
      .from(posts)
      .limit(limit)
      .offset((page - 1) * limit),
  );

  if (!datasetResult.ok) {
    return Err("database error");
  }

  const countResult = await Result.async(
    db.select({ count: sql<number>`count(*)` }).from(posts),
  );

  if (!countResult.ok) {
    return Err("database error");
  }

  return Ok({
    posts: datasetResult.val,
    total: countResult.val[0]?.count ?? 0,
  });
};

export const findPostById = async (
  state: AppState,
  id: number,
): Promise<ResultType<PostModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(posts).where(eq(posts.id, id)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  const post = result.val[0];
  if (!post) {
    return Err("Post not found");
  }

  return Ok(post);
};

export const saveNewPost = async (
  state: AppState,
  authorId: number,
  payload: CreatePostPayload,
): Promise<ResultType<PostModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(posts)
      .values({
        ...payload,
        authorId,
      })
      .returning(),
  );

  if (!result.ok) {
    return Err("failed insert post");
  }

  const newPost = result.val[0];
  if (!newPost) {
    return Err("failed insert post");
  }

  return Ok(newPost);
};

export const savePost = async (
  state: AppState,
  id: number,
  payload: UpdatePostPayload,
): Promise<ResultType<PostModel, string>> => {
  const { db } = state;
  const changeSet = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const result = await Result.async(
    db.update(posts).set(changeSet).where(eq(posts.id, id)).returning(),
  );

  if (!result.ok) {
    return Err("failed update post");
  }

  const updatedPost = result.val[0];
  if (!updatedPost) {
    return Err("failed update post");
  }

  return Ok(updatedPost);
};

export const deletePostById = async (
  state: AppState,
  id: number,
): Promise<ResultType<void, string>> => {
  const { db } = state;
  const result = await Result.async(db.delete(posts).where(eq(posts.id, id)));

  if (!result.ok) {
    return Err("failed delete post");
  }

  return Ok(undefined);
};

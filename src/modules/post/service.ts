import { eq, sql } from "drizzle-orm";
import type { CreatePostPayload, UpdatePostPayload } from "./model";
import type { AppState } from "~/model";
import { posts } from "~/schemas/default";

export const getPosts = async (
  {db}: AppState,
  page: number = 1,
  limit: number = 10,
) => {
  const dataset = await db
    .select()
    .from(posts)
    .limit(limit)
    .offset((page - 1) * limit);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts);

  return {
    posts: dataset,
    total: countResult?.count ?? 0,
  };
};

export const getPostById = async ({db}: AppState, id: number) => {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id));
  return post;
};

export const createPost = async (
  {db}: AppState,
  authorId: number,
  payload: CreatePostPayload,
) => {
  const [newPost] = await db
    .insert(posts)
    .values({
      ...payload,
      authorId,
    })
    .returning();
  return newPost;
};

export const updatePost = async (
  {db}: AppState,
  id: number,
  payload: UpdatePostPayload,
) => {
  const [updatedPost] = await db
    .update(posts)
    .set({
      ...payload,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.id, id))
    .returning();
  return updatedPost;
};

export const deletePost = async ({db}: AppState, id: number) => {
  await db.delete(posts).where(eq(posts.id, id));
};

import { eq } from "drizzle-orm";
import type { CreatePostPayload, UpdatePostPayload } from "./model";
import type { AppState } from "~/model";
import { posts } from "~/schemas/default";

export const getPosts = async (state: AppState) => {
  return await state.dbClient.db.select().from(posts);
};

export const getPostById = async (state: AppState, id: number) => {
  const [post] = await state.dbClient.db
    .select()
    .from(posts)
    .where(eq(posts.id, id));
  return post;
};

export const createPost = async (
  state: AppState,
  authorId: number,
  payload: CreatePostPayload,
) => {
  const [newPost] = await state.dbClient.db
    .insert(posts)
    .values({
      ...payload,
      authorId,
    })
    .returning();
  return newPost;
};

export const updatePost = async (
  state: AppState,
  id: number,
  payload: UpdatePostPayload,
) => {
  const [updatedPost] = await state.dbClient.db
    .update(posts)
    .set({
      ...payload,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.id, id))
    .returning();
  return updatedPost;
};

export const deletePost = async (state: AppState, id: number) => {
  await state.dbClient.db.delete(posts).where(eq(posts.id, id));
};

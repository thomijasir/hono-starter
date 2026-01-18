import postsData from "./mocks/posts.json";
import type { Post } from "./model";

export const getPosts = (): Post[] => {
  return postsData;
};

export const getPostById = (id: number): Post | undefined => {
  return postsData.find((post) => post.id === id);
};
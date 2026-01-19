import { eq } from "drizzle-orm";
import type { AppState } from "~/model";
import { users } from "~/schemas/default";

export const getUsers = async (state: AppState) => {
  const allUsers = await state.db.select().from(users);
  // Return users without sensitive data
  return allUsers.map(({ password: _password, ...user }) => user);
};

export const getUserById = async (state: AppState, id: number) => {
  const [user] = await state.db.select().from(users).where(eq(users.id, id));

  if (user) {
    const { password: _password, ...rest } = user;
    return rest;
  }

  return undefined;
};

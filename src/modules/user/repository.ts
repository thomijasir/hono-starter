import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import type { UserCreatePayload } from "./model";
import type { AppState } from "~/model";
import { DbError } from "~/model";
import { users } from "~/schemas/default";

export const findUserByEmail = (state: AppState, email: string) => {
  const { db } = state;
  const query = db.select().from(users).where(eq(users.email, email));
  return ResultAsync.fromPromise(
    query,
    (e) => new DbError("Failed query user by email", e),
  ).map((users) => users[0] ?? null);
};

export const createNewUser = (
  state: AppState,
  payload: UserCreatePayload,
) => {
  const { db } = state;
  const query = db.insert(users).values(payload).returning();
  return ResultAsync.fromPromise(
    query,
    (e) => new DbError("Failed insert new user", e),
  ).map((users) => users[0]);
};

import { eq, like } from "drizzle-orm";
import type { AppState } from "~/model";
import { users } from "~/schemas/default";
import { Err, Ok, Result } from "~/utils";

export const findUserByEmail = async (state: AppState, email: string) => {
  const { db } = state;
  const [err, user] = await Result.async(
    db.select().from(users).where(eq(users.email, email)),
  );
  if (err) {
    return Err("database error");
  }
  const foundUser = user[0];
  if (!foundUser) {
    return Err("user not found");
  }
  return Ok(foundUser);
};

export const findUserByID = async (state: AppState, id: number) => {
  const { db } = state;
  const [err, user] = await Result.async(
    db.select().from(users).where(eq(users.id, id)),
  );
  if (err) {
    return Err("database error");
  }
  return Ok(user[0]);
};

export const findUserByName = async (state: AppState, name: string) => {
  const { db } = state;
  const [err, user] = await Result.async(
    db
      .select()
      .from(users)
      .where(like(users.name, `%${name}%`)),
  );
  if (err) {
    return Err("database error");
  }
  return Ok(user);
};

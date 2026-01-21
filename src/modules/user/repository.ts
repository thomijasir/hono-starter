import { eq, like } from "drizzle-orm";
import type { AppState } from "~/model";
import { users } from "~/schemas/default";
import { Err, Ok, Result } from "~/utils";
import type { User } from "./model";

/**
 * Finds a user by their email address.
 *
 * @param {AppState} state - The application state containing the database connection.
 * @param {string} email - The email address of the user to find.
 * @returns {Promise<Result<User, string>>} A Result containing the user if found, or an error message.
 */
export const findUserByEmail = async (state: AppState, email: string) => {
  const { db } = state;
  const userResult = await Result.async(
    db.select().from(users).where(eq(users.email, email)),
  );
  if (!userResult.ok) {
    return Err("database error");
  }
  const foundUser = userResult.val[0];
  if (!foundUser) {
    return Err("user not found");
  }
  return Ok(foundUser);
};

/**
 * Finds a user by their ID.
 *
 * @param {AppState} state - The application state containing the database connection.
 * @param {number} id - The ID of the user to find.
 * @returns {Promise<Result<User, string>>} A Result containing the user if found, or an error message.
 */
export const findUserByID = async (state: AppState, id: number) => {
  const { db } = state;
  const userResult = await Result.async(
    db.select().from(users).where(eq(users.id, id)),
  );
  if (!userResult.ok) {
    return Err("database error");
  }
  const foundUser = userResult.val[0];
  if (!foundUser) {
    return Err("user not found");
  }
  return Ok(foundUser);
};

/**
 * Finds users by their name (partial match).
 *
 * @param {AppState} state - The application state containing the database connection.
 * @param {string} name - The name (or partial name) to search for.
 * @returns {Promise<Result<User[], string>>} A Result containing an array of matching users if found, or an error message.
 */
export const findUserByName = async (state: AppState, name: string) => {
  const { db } = state;
  const userResult = await Result.async(
    db
      .select()
      .from(users)
      .where(like(users.name, `%${name}%`)),
  );
  if (!userResult.ok) {
    return Err("database error");
  }
  const foundUsers = userResult.val;
  if (!foundUsers) {
    return Err("user not found");
  }
  return Ok(foundUsers);
};

export const createNewUser = async (state: AppState, user: User) => {
  const { db } = state;
};

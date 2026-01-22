import { eq, like } from "drizzle-orm";
import type { CreateUserPayload } from "./model";
import type { AppState } from "~/model";
import { users } from "~/schemas/default";
import type { UserModel } from "~/schemas/default";
import { Err, Ok, Result } from "~/utils";
import type { ResultType } from "~/utils";

/**
 * Finds a user by their email address.
 *
 * @param {AppState} state - The application state containing the database connection.
 * @param {string} email - The email address of the user to find.
 * @returns {Promise<Result<User, string>>} A Result containing the user if found, or an error message.
 */
export const findUserByEmail = async (
  state: AppState,
  email: string,
): Promise<ResultType<UserModel, string>> => {
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
  if (foundUsers.length === 0) {
    return Err("user not found");
  }
  return Ok(foundUsers);
};

export const saveNewUser = async (
  state: AppState,
  user: CreateUserPayload,
): Promise<ResultType<UserModel, string>> => {
  const { db } = state;
  const result = await Result.async(db.insert(users).values(user).returning());
  if (!result.ok) {
    return Err("failed insert user");
  }
  const createdUser = result.val[0];
  if (!createdUser) {
    return Err("user not found");
  }
  return Ok(createdUser);
};

export const saveUser = async (
  state: AppState,
  id: number,
  payload: CreateUserPayload,
): Promise<ResultType<UserModel, string>> => {
  const { db } = state;
  const changeSet = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const result = await Result.async(
    db.update(users).set(changeSet).where(eq(users.id, id)).returning(),
  );
  if (!result.ok) {
    return Err("failed update user");
  }
  const updatedUser = result.val[0];
  if (!updatedUser) {
    return Err("failed update user");
  }
  return Ok(updatedUser);
};

export const findAllUsers = async (
  state: AppState,
): Promise<ResultType<UserModel[], string>> => {
  const { db } = state;
  const result = await Result.async(db.select().from(users));
  if (!result.ok) {
    return Err("database error");
  }
  return Ok(result.val);
};

import { eq, like } from "drizzle-orm";
import type { CreateUserType } from "./model";
import type { AppState } from "~/model";
import { user } from "~/schemas/default";
import type { UserModel } from "~/schemas/default";
import { Err, generateUUID, Ok, Result } from "~/utils";
import type { ResultType } from "~/utils";

/**
 * Finds a user by their email address.
 *
 * @param {AppState} state - The application state containing the database connection.
 * @param {string} email - The email address of the user to find.
 * @returns {Promise<Result<User, Error | string>>} A Result containing the user if found, or an error message.
 */
export const findUserByEmail = async (
  state: AppState,
  email: string,
): Promise<ResultType<UserModel, Error | string>> => {
  const { db } = state;
  const userResult = await Result.async(
    db.select().from(user).where(eq(user.email, email)),
  );
  if (!userResult.ok) {
    return userResult;
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
 * @returns {Promise<Result<User, Error>>} A Result containing the user if found, or an error message.
 */
export const findUserByID = async (state: AppState, id: string) => {
  const { db } = state;
  const userResult = await Result.async(
    db.select().from(user).where(eq(user.id, id)),
  );
  if (!userResult.ok) {
    return userResult;
  }
  const foundUser = userResult.val[0];
  if (!foundUser) {
    return Err("user not found");
  }
  return Ok(foundUser);
};

/**
 * Finds user by their name (partial match).
 *
 * @param {AppState} state - The application state containing the database connection.
 * @param {string} name - The name (or partial name) to search for.
 * @returns {Promise<Result<User[], string>>} A Result containing an array of matching user if found, or an error message.
 */
export const findUserByName = async (state: AppState, name: string) => {
  const { db } = state;
  const userResult = await Result.async(
    db
      .select()
      .from(user)
      .where(like(user.name, `%${name}%`)),
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
  payload: CreateUserType,
): Promise<ResultType<UserModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(user)
      .values({ ...payload, id: generateUUID() })
      .returning(),
  );
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
  id: string,
  payload: CreateUserType,
): Promise<ResultType<UserModel, string>> => {
  const { db } = state;
  const changeSet = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const result = await Result.async(
    db.update(user).set(changeSet).where(eq(user.id, id)).returning(),
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
  const result = await Result.async(db.select().from(user));
  if (!result.ok) {
    return Err("database error");
  }
  return Ok(result.val);
};

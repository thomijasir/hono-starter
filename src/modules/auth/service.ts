import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { sign } from "hono/jwt";
import { resultAsync } from "~/utils";
import type { LoginPayload, RegisterPayload } from "./model";
import type { AppState } from "~/model";
import { users } from "~/schemas/default";
import { Err, Ok, Result } from "ts-results";

export const login = async (
  { db, config }: AppState,
  payload: LoginPayload,
): Promise<Result<{ token: string }, Error>> => {
  const userResult = await resultAsync(
    db.select().from(users).where(eq(users.email, payload.email)),
  );

  const user = userResult
    .andThen((u) => Ok(u[0]))
    .mapErr(() => new Error("database error"))
    .unwrap();

  if (!user) return Err(new Error("user notfound"));

  const matchResult = await resultAsync(
    Bun.password.verify(payload.password, user.password),
  );
  if (matchResult.err) return matchResult;
  if (!matchResult.val) return Err(new Error("Invalid credentials"));

  const tokenResult = await resultAsync(
    sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
      },
      config.jwtSecret,
    ),
  );

  if (tokenResult.err) return tokenResult;

  return Ok({ token: tokenResult.val });
};

export const register = async (state: AppState, payload: RegisterPayload) => {
  const db = state.db as BunSQLiteDatabase;
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, payload.email));

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await Bun.password.hash(payload.password, {
    algorithm: "bcrypt",
    cost: 4,
  });

  const [newUser] = await db
    .insert(users)
    .values({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    })
    .returning();

  if (!newUser) {
    throw new Error("Failed to register user");
  }

  const token = await sign(
    {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    },
    state.config.jwtSecret,
  );

  return { token };
};

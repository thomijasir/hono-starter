import { eq } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { sign } from "hono/jwt";
import type { LoginPayload, RegisterPayload } from "./model";
import type { AppState } from "~/model";
import { users } from "~/schemas/default";
import { HTTPException } from "hono/http-exception";

export const login = async (state: AppState, payload: LoginPayload) => {
  const db = state.db as BunSQLiteDatabase;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, payload.email));

  if (!user) {
    throw new HTTPException(400, {
      message: "Invalid email or password",
    });
  }

  const isMatch = await Bun.password.verify(payload.password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const now = Math.floor(Date.now() / 1000);

  const token = await sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: now,
      exp: now + 60 * 60 * 24, // 1 day
    },
    state.config.jwtSecret,
  );

  return { token };
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

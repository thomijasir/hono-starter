import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { ResultAsync } from "neverthrow";
import type { User } from "../user/model";
import type { RegisterPayload } from "./model";
import { EXPIRED_TOKEN } from "~/constants";
import { JwtSignError  } from "~/model";
import type {AppState} from "~/model";
import { users } from "~/schemas/default";


export const signToken = async (user: User, secret: string) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    iat: now,
    exp: now + EXPIRED_TOKEN,
  };
  return ResultAsync.fromPromise(
    sign(payload, secret),
    () => new JwtSignError(),
  );
};

export const register = async (
  { db, config }: AppState,
  payload: RegisterPayload,
) => {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, payload.email));

  if (existingUser) {
    // eslint-disable-next-line functional/no-throw-statements
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
    // eslint-disable-next-line functional/no-throw-statements
    throw new Error("Failed to register user");
  }

  const token = await sign(
    {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    },
    config.jwtSecret,
  );

  return { token };
};

import { sign } from "hono/jwt";
import type { User } from "../user/model";
import { EXPIRED_TOKEN } from "~/constants";
import { Err, Ok, Result } from "~/utils";

export const signToken = async (user: User, secret: string) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    iat: now,
    exp: now + EXPIRED_TOKEN,
  };
  const result = await Result.async(sign(payload, secret));
  if (!result.ok) {
    return Err("failure sign secrets");
  }
  return Ok(result.val);
};

import { sign } from "hono/jwt";
import type { UserType } from "../user/model";
import { EXPIRED_TOKEN } from "~/constants";
import { Err, Ok, Result } from "~/utils";

export const signToken = async (payload: UserType, secret: string) => {
  const now = Math.floor(Date.now() / 1000);
  const envelope = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    iat: now,
    exp: now + EXPIRED_TOKEN,
  };
  const result = await Result.async(sign(envelope, secret));
  if (!result.ok) {
    return Err("failure sign secrets");
  }
  return Ok(result.val);
};

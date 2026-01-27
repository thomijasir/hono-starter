import { sign } from "hono/jwt";
import type { ConnectType } from "./model";
import { CHAT_TOKEN_EXPIRED } from "~/constants";
import { Err, Ok, Result } from "~/utils";

export const signChatToken = async (
  payload: ConnectType,
  secret: string,
) => {
  const now = Math.floor(Date.now() / 1000);
  const envelopePayload = {
    ...payload,
    iat: now,
    exp: now + CHAT_TOKEN_EXPIRED,
  };
  const result = await Result.async(sign(envelopePayload, secret));
  if (!result.ok) {
    return Err("failure sign secrets");
  }
  return Ok(result.val);
};

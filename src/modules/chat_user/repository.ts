import type { AppState } from "~/model";
import { Err, nowDate, nowUnix, Ok, Result } from "~/utils";
import { chatUser } from "~/schemas/default";
import type { ConnectPayload } from "../chat/model";
import { CHAT_TOKEN_EXPIRED } from "~/constants";

export const saveOrUpdateChatUser = async (
  state: AppState,
  payload: ConnectPayload,
) => {
  const { db } = state;
  const lastSeen = new Date(nowUnix() + CHAT_TOKEN_EXPIRED).toISOString();
  const result = await Result.async(
    db
      .insert(chatUser)
      .values({
        id: `${payload.appId}_${payload.username}`, // Composite ID simulation
        appId: payload.appId,
        name: payload.name,
        avatar: payload.avatar,
        email: payload.email,
        deviceToken: payload.deviceToken,
        deviceType: payload.deviceType,
        lastSeen: lastSeen,
      })
      .onConflictDoUpdate({
        target: chatUser.id,
        set: {
          lastSeen: lastSeen,
          deviceToken: payload.deviceToken,
          deviceType: payload.deviceType,
          name: payload.name,
          avatar: payload.avatar,
          email: payload.email,
          updatedAt: nowDate(),
        },
      })
      .returning(),
  );
  if (!result.ok) {
    return Err("database error");
  }

  const [user] = result.val;
  if (!user) {
    return Err("not found either");
  }

  return Ok(user);
};

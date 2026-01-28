import type { ConnectType } from "../chat/model";
import { CHAT_TOKEN_EXPIRED } from "~/constants";
import type { AppState } from "~/model";
import { chatUsers } from "~/schemas/default";
import { Err, nowDate, nowUnix, Ok, Result } from "~/utils";

export const saveOrUpdateChatUser = async (
  state: AppState,
  payload: ConnectType,
) => {
  const { db } = state;
  const lastSeen = new Date(nowUnix() + CHAT_TOKEN_EXPIRED).toISOString();
  const result = await Result.async(
    db
      .insert(chatUsers)
      .values({
        id: `${payload.appId}|${payload.externalId}`, // Composite ID simulation
        appId: payload.appId,
        name: payload.name,
        avatar: payload.avatar,
        email: `${payload.appId}|${payload.email}`,
        deviceToken: payload.deviceToken,
        deviceType: payload.deviceType,
        lastSeen: lastSeen,
      })
      .onConflictDoUpdate({
        target: chatUsers.id,
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

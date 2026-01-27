import { saveOrUpdateChatUser } from "../chat_user/repository";
import type { ConnectType } from "./model";
import { signChatToken } from "./service";
import { createJsonHandler } from "~/utils";

export const connect = createJsonHandler<ConnectType>(
  async ({ state, body, httpResponse, errorResponse }) => {
    const resultUser = await saveOrUpdateChatUser(state, body);

    if (!resultUser.ok) {
      return errorResponse(resultUser.err);
    }

    const resultToken = await signChatToken(body, state.config.jwtSecret);

    if (!resultToken.ok) {
      return errorResponse("failed create chat token");
    }
    return httpResponse({ token: resultToken.val });
  },
);

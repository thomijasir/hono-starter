import { createJsonHandler } from "~/utils";
import type { ConnectPayload } from "./model";
import { saveOrUpdateChatUser } from "../chat_user/repository";
import { signChatToken } from "./service";

export const connect = createJsonHandler<ConnectPayload>(
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

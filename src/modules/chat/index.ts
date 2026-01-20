import { Hono } from "hono";
import * as controller from "./controller";
import {
  AddParticipantSchema,
  ConnectSchema,
  CreateConversationSchema,
  SendMessageSchema,
  UploadFileSchema,
} from "./model";
import { validator } from "~/middlewares";

export const chatModule = () => {
  const routes = new Hono();

  // Connect / Auth
  routes.post("/connect", validator("json", ConnectSchema), controller.connect);

  // Conversations
  routes.post(
    "/conversations",
    validator("json", CreateConversationSchema),
    controller.createConversation,
  );
  routes.get("/conversations", controller.getConversations);

  // Group Management
  routes.post(
    "/groups/:id/participants",
    validator("json", AddParticipantSchema),
    controller.addParticipants,
  );
  routes.delete(
    "/groups/:id/participants/:userId",
    controller.removeParticipant,
  );

  // Messages
  routes.post(
    "/conversations/:id/messages",
    validator("json", SendMessageSchema),
    controller.sendMessage,
  );
  routes.get("/conversations/:id/messages", controller.getMessages);

  // Media
  // TODO: Add media validation
  routes.post("/upload", validator("form", UploadFileSchema), controller.uploadFile);

  // LiveKit
  // :id in this context is the conversation ID or room ID
  routes.get("/calls/:id/token", controller.getCallToken);
  routes.post("/conversations/:id/call", controller.startCall);
  routes.post("/calls/:id/end", controller.endCall);

  return routes;
};

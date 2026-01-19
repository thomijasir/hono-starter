import { Hono } from "hono";
import * as chatController from "./controller";

export const chatRoutes = new Hono();

// Connect / Auth
chatRoutes.post("/connect", chatController.connect);

// Conversations
chatRoutes.post("/conversations", chatController.createConversation);
chatRoutes.get("/conversations", chatController.getConversations);

// Group Management
chatRoutes.post("/groups/:id/participants", chatController.addParticipants);
chatRoutes.delete("/groups/:id/participants/:userId", chatController.removeParticipant);

// Messages
chatRoutes.post("/conversations/:id/messages", chatController.sendMessage);
chatRoutes.get("/conversations/:id/messages", chatController.getMessages);

// Media
chatRoutes.post("/upload", chatController.uploadFile);

// LiveKit
// :id in this context is the conversation ID or room ID
chatRoutes.get("/calls/:id/token", chatController.getCallToken);
chatRoutes.post("/conversations/:id/call", chatController.startCall);
chatRoutes.post("/calls/:id/end", chatController.endCall);

